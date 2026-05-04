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
import { RedisService } from '../redis/redis.service';

@Injectable()
export class EvidenceService {
  private supabase;
  private readonly logger = new Logger(EvidenceService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => MonitoringGateway)) // Inyectamos el gateway
    private readonly monitoringGateway: MonitoringGateway,
    private readonly redis: RedisService,
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

  /**
   * LÓGICA COMPARTIDA: Inserta la incidencia en la DB
   * Acepta un cliente de Prisma (tx) para poder ser parte de una transacción
   */
  private async executeInsertIncident(
    tx: any,
    dto: CreateIncidentDto,
    fotoUrl: string | null,
  ) {
    const {
      pedidoId,
      rutaId,
      tipo,
      descripcion,
      latitude,
      longitude,
      estado_incidencia,
      categoria,
    } = dto;

    const queryResult = await tx.$executeRaw`
    INSERT INTO incidencias (
      ruta_id, pedido_id, tipo, descripcion, foto_url, coordenadas_incidente, estado_incidencia, categoria
    ) VALUES (
      ${rutaId}::uuid, 
      ${pedidoId ? pedidoId : null}::uuid, 
      ${tipo}, 
      ${descripcion}, 
      ${fotoUrl},
      ST_SetSRID(ST_MakePoint(${+longitude}, ${+latitude}), 4326)::geography,
      ${estado_incidencia || 'abierta'},
      ${categoria || 'camino'}
    )
  `;

    // EMITIR ALERTA AL DASHBOARD
    // Nota: Como es un Raw Query, necesitamos emitir el evento después
    this.monitoringGateway.server.emit('newIncidentAlert', {
      tipo: dto.tipo,
      descripcion: dto.descripcion,
      rutaId: dto.rutaId,
      categoria: dto.categoria || 'camino',
      coordenadas: { lat: dto.latitude, lng: dto.longitude },
      fecha: new Date(),
    });

    return queryResult;
  }

  async saveIncident(dto: CreateIncidentDto, file?: Express.Multer.File) {
    try {
      // FORZAMOS LA CATEGORÍA PARA INCIDENTES DE RUTA
      dto.categoria = 'camino';
      let fotoUrl = null;
      if (file) {
        const fileName = `incidente_${Date.now()}.jpg`;
        fotoUrl = await this.uploadBufferToSupabase(
          file.buffer,
          `incidentes/${fileName}`,
          file.mimetype,
        );
      }

      return await this.prisma.$transaction(async (tx) => {
        await this.executeInsertIncident(tx, dto, fotoUrl);
        return { success: true, message: 'Incidente registrado.' };
      });
    } catch (error: any) {
      console.log('🚨 ERROR EN API:', error.response?.data || error.message);
      throw new InternalServerErrorException('Error al guardar incidente.');
    }
  }

  async saveFailedDelivery(dto: CreateIncidentDto, file?: Express.Multer.File) {
    try {
      // FORZAMOS LA CATEGORÍA PARA ENTREGAS FALLIDAS
      dto.categoria = 'entrega';
      let fotoUrl = null;
      if (file) {
        const fileName = `fallido_${dto.pedidoId}_${Date.now()}.jpg`;
        fotoUrl = await this.uploadBufferToSupabase(
          file.buffer,
          `incidentes/fallidos/${fileName}`,
          file.mimetype,
        );
      }

      return await this.prisma.$transaction(async (tx) => {
        // Reutilizamos el insert
        await this.executeInsertIncident(tx, dto, fotoUrl);

        // Añadimos la actualización del pedido
        await tx.pedidos.update({
          where: { id: dto.pedidoId },
          data: { estado_pedido: 'fallido' },
        });

        this.monitoringGateway.server.emit('fleetListUpdated');
        return {
          success: true,
          message: 'Pedido marcado como fallido y reporte guardado.',
        };
      });
    } catch (error) {
      this.logger.error(`Error en saveFailedDelivery: ${error.message}`);
      throw new InternalServerErrorException(
        'No se pudo procesar el fallo de entrega.',
      );
    }
  }

  async saveFailedRoute(dto: CreateIncidentDto) {
    try {
      // 1. Forzamos los datos requeridos
      dto.categoria = 'tiempo';
      dto.tipo = 'ruta fallida';
      dto.descripcion =
        'El dia no fue suficiente para entregar todos los pedidos';
      dto.pedidoId = undefined;

      // 2. Obtener información de la ruta para el fallback de fecha
      const ruta = await this.prisma.rutas.findUnique({
        where: { id: dto.rutaId },
      });

      if (!ruta) throw new NotFoundException('Ruta no encontrada');

      // 3. Extraer datos de Redis ANTES de la transacción
      const redisStartTime = await this.redis.getStartTime(dto.rutaId);
      const fechaInicioFinal = redisStartTime || ruta.created_at.toISOString();
      const rawPoints = await this.redis.getRoutePoints(dto.rutaId);

      // Procesamiento de puntos de Redis
      const points = rawPoints
        .map((p: any) => {
          if (typeof p === 'string') {
            try {
              return JSON.parse(p);
            } catch {
              return null;
            }
          }
          return p;
        })
        .filter(
          (p) => p !== null && p.lng !== undefined && p.lat !== undefined,
        );

      let lineStringWKT = null;
      if (points.length >= 2) {
        const wktPoints = points.map((p) => `${p.lng} ${p.lat}`).join(', ');
        lineStringWKT = `LINESTRING(${wktPoints})`;
      }

      // 4. Transacción maestra
      return await this.prisma.$transaction(async (tx) => {
        // A. Insertar la incidencia original
        await this.executeInsertIncident(tx, dto, null);

        // B. Cambiar a 'fallido' todos los pedidos pendientes o en tránsito de esta ruta
        await tx.pedidos.updateMany({
          where: {
            detalles_ruta: { some: { ruta_id: dto.rutaId } },
            estado_pedido: { in: ['pendiente', 'en_transito'] },
          },
          data: { estado_pedido: 'fallido' },
        });

        // C. Procesar trayectoria si hay suficientes puntos
        if (lineStringWKT) {
          const yaExiste =
            await tx.$queryRaw`SELECT 1 FROM trayectos_finalizados WHERE ruta_id = ${dto.rutaId}::uuid`;
          if ((yaExiste as any[]).length === 0) {
            await tx.$executeRawUnsafe(`
              INSERT INTO trayectos_finalizados (ruta_id, geometria_ruta, distancia_total_km, fecha_inicio)
              VALUES (
                '${dto.rutaId}'::uuid,
                ST_GeogFromText('${lineStringWKT}'),
                ST_Length(ST_GeogFromText('${lineStringWKT}')) / 1000,
                '${fechaInicioFinal}'
              )
            `);
          }
        }

        // D. Cambiar estatus de la ruta a 'finalizada' para cerrar el ciclo
        await tx.rutas.update({
          where: { id: dto.rutaId },
          data: { estatus_ruta: 'finalizada', updated_at: new Date() },
        });

        // E. Limpiar ubicación actual para remover al chofer del mapa en vivo
        await tx.ubicacion_actual.deleteMany({
          where: { ruta_id: dto.rutaId },
        });

        // F. Limpiar Redis
        await this.redis.clearRouteData(dto.rutaId);

        // G. Notificar al panel web
        this.monitoringGateway.server.emit('fleetListUpdated');

        return {
          success: true,
          message:
            'Jornada finalizada: Trayecto guardado y pedidos marcados como fallidos.',
        };
      });
    } catch (error) {
      this.logger.error(`Error en saveFailedRoute: ${error.message}`);
      throw new InternalServerErrorException(
        'No se pudo procesar el reporte de ruta fallida.',
      );
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
        i.categoria,
        ST_X(i.coordenadas_incidente::geometry) as "longitude",
        ST_Y(i.coordenadas_incidente::geometry) as "latitude",
        p.codigo_rastreo as "codigoPedido"
      FROM incidencias i
      JOIN rutas r ON i.ruta_id = r.id
      LEFT JOIN pedidos p ON i.pedido_id = p.id
      WHERE r.chofer_id = ${choferId}::uuid
        AND i.categoria = 'camino' 
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
