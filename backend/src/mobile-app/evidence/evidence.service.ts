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

@Injectable()
export class EvidenceService {
  private supabase;
  private readonly logger = new Logger(EvidenceService.name);
  constructor(private prisma: PrismaService) {
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
          奠 SELECT c.coordenadas 
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
    const { pedidoId, rutaId, tipo, descripcion, latitude, longitude } = dto;
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
          ruta_id, 
          pedido_id, 
          tipo, 
          descripcion, 
          foto_url,
          coordenadas_incidente,
          estado_incidencia
        ) VALUES (
          ${rutaId}::uuid, 
          ${pedidoId ? pedidoId : null}::uuid, 
          ${tipo}, 
          ${descripcion}, 
          ${fotoUrl},
          ST_SetSRID(ST_MakePoint(${+longitude}, ${+latitude}), 4326)::geography,
          'pendiente'
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

      const incidents = await this.prisma.$queryRaw`
        SELECT 
          i.id,
          i.tipo,
          i.descripcion,
          i.estado_incidencia as "estado",
          i.foto_url as "fotoUrl",
          i.pedido_id as "pedidoId",
          i.ruta_id as "rutaId",
          i.created_at as "createdAt",
          ST_X(i.coordenadas_incidente::geometry) as "longitude",
          ST_Y(i.coordenadas_incidente::geometry) as "latitude",
          p.codigo_rastreo as "codigoPedido"
        FROM incidencias i
        JOIN rutas r ON i.ruta_id = r.id
        LEFT JOIN pedidos p ON i.pedido_id = p.id
        WHERE r.chofer_id = ${choferId}::uuid
        ORDER BY i.created_at DESC
      `;

      return incidents;
    } catch (error) {
      this.logger.error(`Error al obtener incidencias: ${error.message}`);
      throw new InternalServerErrorException(
        'Error al consultar el historial de incidentes.',
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

      return await this.prisma.incidencias.update({
        where: { id },
        data: {
          ...(estado_incidencia && { estado_incidencia }),
          ...(descripcion && { descripcion }),
          ...(tipo && { tipo }),
          updated_at: new Date(),
        },
      });
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
}
