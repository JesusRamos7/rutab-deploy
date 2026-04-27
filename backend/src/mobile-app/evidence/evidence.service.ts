// /backend/src/mobile-app/evidence/evidence.service.ts

import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { forwardRef, Inject } from '@nestjs/common';
import { MonitoringGateway } from '../../modules/monitoring/gateways/monitoring.gateway';

@Injectable()
export class EvidenceService {
  private supabase;
  private readonly logger = new Logger(EvidenceService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => MonitoringGateway)) // Inyectamos el gateway
    private readonly monitoringGateway: MonitoringGateway,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  /**
   * Helper genérico para subir un Buffer al Storage de Supabase
   */
  private async uploadBufferToSupabase(
    buffer: Buffer,
    path: string,
    mimetype: string,
  ) {
    const { data, error } = await this.supabase.storage
      .from('evidencias')
      .upload(path, buffer, {
        contentType: mimetype,
        upsert: true, // Si el archivo ya existe, lo sobrescribe
      });

    if (error) {
      throw new InternalServerErrorException(
        `Error Supabase: ${error.message}`,
      );
    }
    return data.path;
  }

  async saveEvidence(dto: CreateEvidenceDto, photoFile: Express.Multer.File) {
    const { pedidoId, firmaBase64, latitude, longitude } = dto;
    const UMBRAL_METROS = 100; // Distancia máxima para auto-aprobación

    try {
      // 1. Procesar Fotografía
      const fotoFileName = `foto_${pedidoId}_${Date.now()}.jpg`;
      const fotoPath = await this.uploadBufferToSupabase(
        photoFile.buffer,
        `pedidos/fotos/${fotoFileName}`,
        photoFile.mimetype,
      );

      // 2. Procesar Firma
      const base64Data = firmaBase64.replace(/^data:image\/\w+;base64,/, '');
      const firmaBuffer = Buffer.from(base64Data, 'base64');
      const firmaFileName = `firma_${pedidoId}_${Date.now()}.png`;
      const firmaPath = await this.uploadBufferToSupabase(
        firmaBuffer,
        `pedidos/firmas/${firmaFileName}`,
        'image/png',
      );

      // 3. Persistencia con cálculo de distancia
      return await this.prisma.$transaction(async (tx) => {
        /**
         * Usamos una consulta que busca la coordenada del cliente a través del pedido
         * y calcula la distancia vs el punto enviado por el chofer.
         */
        await tx.$executeRaw`
        WITH info_cliente AS (
          SELECT c.coordenadas 
          FROM pedidos p
          JOIN clientes c ON p.cliente_id = c.id
          WHERE p.id = ${pedidoId}::uuid
          LIMIT 1
        )
        INSERT INTO evidencias (
          pedido_id, 
          foto_url, 
          firma_url, 
          coordenadas_entrega,
          estado_evidencia
        ) 
        SELECT 
          ${pedidoId}::uuid, 
          ${fotoPath}, 
          ${firmaPath}, 
          ST_SetSRID(ST_MakePoint(${+longitude}, ${+latitude}), 4326)::geography,
          CASE 
            WHEN ST_Distance(
              ST_SetSRID(ST_MakePoint(${+longitude}, ${+latitude}), 4326)::geography, 
              (SELECT coordenadas FROM info_cliente)
            ) <= ${UMBRAL_METROS} THEN 'auto aprobada'
            ELSE 'alerta'
          END
        FROM info_cliente;
      `;

        // Actualizamos el estado del pedido
        await tx.pedidos.update({
          where: { id: pedidoId },
          data: { estado_pedido: 'entregado' },
        });

        // Emitimos un evento para que el frontend actualice su lista de pedidos
        this.monitoringGateway.server.emit('fleetListUpdated');

        return {
          success: true,
          message: 'Evidencia procesada correctamente',
        };
      });
    } catch (error) {
      console.error('Error crítico en saveEvidence:', error);
      throw new InternalServerErrorException('No se pudo procesar la entrega.');
    }
  }

  async saveIncident(dto: CreateIncidentDto, file?: Express.Multer.File) {
    const {
      pedidoId,
      rutaId,
      tipo,
      descripcion,
      latitude,
      longitude,
      estado_incidencia,
    } = dto;
    let fotoUrl = null;

    try {
      if (file) {
        const fileName = `incidente_${Date.now()}.jpg`;
        fotoUrl = await this.uploadBufferToSupabase(
          file.buffer,
          `incidentes/${fileName}`,
          file.mimetype,
        );
      }

      return await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`
        INSERT INTO incidencias (
          ruta_id, pedido_id, tipo, descripcion, foto_url, coordenadas_incidente,
          estado_incidencia -- Usamos el valor del DTO
        ) VALUES (
          ${rutaId}::uuid, 
          ${pedidoId ? pedidoId : null}::uuid, 
          ${tipo}, 
          ${descripcion}, 
          ${fotoUrl},
          ST_SetSRID(ST_MakePoint(${+longitude}, ${+latitude}), 4326)::geography,
          ${estado_incidencia || 'abierta'} -- Fallback a abierta
        )
      `;
        return { success: true, message: 'Incidente registrado.' };
      });
    } catch (error) {
      this.logger.error(`Error en saveIncident: ${error.message}`);
      throw new InternalServerErrorException('Error al guardar incidente.');
    }
  }

  async getIncidentsByChofer(choferId: string) {
    try {
      this.logger.log(`Obteniendo incidencias para el chofer: ${choferId}`);

      // 1. Obtener los datos crudos de la DB (Trae el path, ej: "incidentes/foto.jpg")
      const incidents: any[] = await this.prisma.$queryRaw`
      SELECT 
        i.id, i.tipo, i.descripcion, i.estado_incidencia as "estado",
        i.foto_url as "fotoUrl", i.pedido_id as "pedidoId",
        i.ruta_id as "rutaId", i.created_at as "createdAt",
        ST_X(i.coordenadas_incidente::geometry) as "longitude",
        ST_Y(i.coordenadas_incidente::geometry) as "latitude",
        p.codigo_rastreo as "codigoPedido"
      FROM incidencias i
      JOIN rutas r ON i.ruta_id = r.id
      LEFT JOIN pedidos p ON i.pedido_id = p.id
      WHERE r.chofer_id = ${choferId}::uuid
      ORDER BY i.created_at DESC
    `;

      // 2. Generar URLs firmadas para las fotos
      const paths = incidents.map((i) => i.fotoUrl).filter(Boolean);

      if (paths.length > 0) {
        // Creamos URLs que expiran en 1 hora (3600 segundos)
        const { data: signedUrls, error } = await this.supabase.storage
          .from('evidencias')
          .createSignedUrls(paths, 3600);

        if (error) {
          this.logger.error(`Error al firmar URLs: ${error.message}`);
        } else {
          // Mapeamos las URLs firmadas de vuelta a los incidentes
          return incidents.map((incident) => {
            const signed = signedUrls.find((s) => s.path === incident.fotoUrl);
            return {
              ...incident,
              fotoUrl: signed ? signed.signedUrl : null,
            };
          });
        }
      }

      return incidents;
    } catch (error) {
      this.logger.error(`Error al obtener incidencias: ${error.message}`);
      throw new InternalServerErrorException(
        'Error al consultar el historial.',
      );
    }
  }

  /**
   * Actualiza el estado o descripción de una incidencia.
   */
  async updateIncident(id: string, dto: UpdateIncidentDto) {
    const { estado_incidencia, descripcion, tipo } = dto;

    try {
      this.logger.log(
        `Actualizando incidencia ${id} a estado: ${estado_incidencia}`,
      );

      const incidenciaExistente = await this.prisma.incidencias.findUnique({
        where: { id },
      });

      if (!incidenciaExistente) {
        throw new NotFoundException('La incidencia no existe.');
      }

      await this.prisma.incidencias.update({
        where: { id },
        data: {
          ...(estado_incidencia && { estado_incidencia }),
          ...(descripcion && { descripcion }),
          ...(tipo && { tipo }),
          updated_at: new Date(),
        },
      });

      this.monitoringGateway.server.emit('fleetListUpdated');

      return {
        success: true,
        message: 'Incidente actualizado correctamente.',
      };
    } catch (error) {
      this.logger.error(
        `Error al actualizar incidencia ${id}: ${error.message}`,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'No se pudo actualizar la incidencia.',
      );
    }
  }

  async deleteIncident(id: string) {
    try {
      // 1. Buscar la incidencia para obtener la URL de la foto
      const incident = await this.prisma.incidencias.findUnique({
        where: { id },
        select: { foto_url: true },
      });

      if (!incident) {
        throw new NotFoundException('La incidencia no existe.');
      }

      // 2. Si tiene foto, borrarla de Supabase Storage
      if (incident.foto_url) {
        const { error } = await this.supabase.storage
          .from('evidencias')
          .remove([incident.foto_url]);

        if (error) {
          this.logger.error(
            `Error borrando foto de Supabase: ${error.message}`,
          );
          // Nota: Continuamos con el borrado del registro aunque falle el storage
        } else {
          this.logger.log(`Foto eliminada de Supabase: ${incident.foto_url}`);
        }
      }

      // 3. Borrar el registro de la DB
      await this.prisma.incidencias.delete({
        where: { id },
      });

      return { success: true, message: 'Incidencia eliminada correctamente.' };
    } catch (error) {
      this.logger.error(`Error al eliminar incidencia ${id}: ${error.message}`);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'No se pudo eliminar la incidencia.',
      );
    }
  }
}
