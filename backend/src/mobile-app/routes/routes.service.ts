// backend/src/mobile-app/routes/routes.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class RoutesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getActiveRoute(choferId: string) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const ruta = await this.prisma.rutas.findFirst({
      where: {
        chofer_id: choferId,
        estatus_ruta: { in: ['programada', 'en_proceso'] },
        fecha_programada: hoy,
      },
      select: {
        id: true,
        fecha_programada: true,
        estatus_ruta: true,
        vehiculos: {
          select: { placas: true, marca: true, modelo: true },
        },
        created_at: true,
      },
    });

    if (!ruta) {
      throw new NotFoundException('No tienes ninguna ruta asignada para hoy.');
    }

    const pedidos = await this.prisma.$queryRaw<any[]>`
      SELECT 
        dr.id as "detalleId",
        dr.orden_entrega as "orden",
        p.id as "pedidoId",
        p.descripcion_carga as "descripcion",
        p.estado_pedido as "estado",
        c.nombre as "cliente",
        c.direccion as "direccion",
        ST_X(c.coordenadas::geometry) as "longitude",
        ST_Y(c.coordenadas::geometry) as "latitude"
      FROM detalles_ruta dr
      JOIN pedidos p ON dr.pedido_id = p.id
      JOIN clientes c ON p.cliente_id = c.id
      WHERE dr.ruta_id = ${ruta.id}::uuid
        AND p.estado_pedido = 'pendiente'
      ORDER BY dr.orden_entrega ASC
    `;

    return {
      ...ruta,
      pedidos,
    };
  }

  async startRoute(rutaId: string, choferId: string) {
    const ruta = await this.prisma.rutas.findFirst({
      where: {
        id: rutaId,
        chofer_id: choferId,
        estatus_ruta: 'programada',
      },
    });

    if (!ruta) {
      throw new BadRequestException(
        'La ruta no existe, ya inició o no tienes permiso.',
      );
    }

    return this.prisma.rutas.update({
      where: { id: rutaId },
      data: {
        estatus_ruta: 'en_proceso',
        updated_at: new Date(),
      },
    });
  }

  async updateLocation(dto: UpdateLocationDto, choferId: string) {
    const ruta = await this.prisma.rutas.findFirst({
      where: {
        id: dto.rutaId,
        chofer_id: choferId,
        estatus_ruta: 'en_proceso',
      },
    });

    if (!ruta) {
      throw new BadRequestException(
        'La ruta no es válida o no está en proceso.',
      );
    }

    await this.redis.pushLocation(dto.rutaId, dto);

    await this.prisma.$executeRaw`
      INSERT INTO ubicacion_actual (ruta_id, ultima_coordenada, velocidad_kmh, nivel_bateria, fecha_actualizacion)
      VALUES (
        ${dto.rutaId}::uuid, 
        ST_SetSRID(ST_MakePoint(${dto.longitude}, ${dto.latitude}), 4326)::geography, 
        ${dto.velocidad || 0}, 
        ${dto.bateria || 0}, 
        NOW()
      )
      ON CONFLICT (ruta_id) 
      DO UPDATE SET 
        ultima_coordenada = EXCLUDED.ultima_coordenada,
        velocidad_kmh = EXCLUDED.velocidad_kmh,
        nivel_bateria = EXCLUDED.nivel_bateria,
        fecha_actualizacion = NOW();
    `;

    return { success: true };
  }

  async finishRoute(rutaId: string, choferId: string) {
    const ruta = await this.prisma.rutas.findFirst({
      where: { id: rutaId, chofer_id: choferId, estatus_ruta: 'en_proceso' },
    });

    if (!ruta)
      throw new BadRequestException('Ruta no encontrada o no está en proceso.');

    const rawPoints = await this.redis.getRoutePoints(rutaId);

    if (!rawPoints || rawPoints.length < 2) {
      await this.prisma.rutas.update({
        where: { id: rutaId },
        data: { estatus_ruta: 'finalizada', updated_at: new Date() },
      });
      return { message: 'Ruta finalizada sin trayectoria (pocos puntos).' };
    }

    // --- CORRECCIÓN AQUÍ ---
    // Upstash ya devuelve objetos si detecta JSON. Validamos el tipo antes de parsear.
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
      .filter((p) => p !== null && p.lng !== undefined && p.lat !== undefined);

    if (points.length < 2) {
      throw new BadRequestException(
        'Datos de trayectoria insuficientes tras procesamiento.',
      );
    }

    const wktPoints = points.map((p) => `${p.lng} ${p.lat}`).join(', ');
    const lineStringWKT = `LINESTRING(${wktPoints})`;

    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`
        INSERT INTO trayectos_finalizados (ruta_id, geometria_ruta, distancia_total_km, fecha_inicio)
        VALUES (
          '${rutaId}'::uuid,
          ST_GeogFromText('${lineStringWKT}'),
          ST_Length(ST_GeogFromText('${lineStringWKT}')) / 1000,
          '${ruta.created_at.toISOString()}'
        )
      `);

      await tx.rutas.update({
        where: { id: rutaId },
        data: { estatus_ruta: 'finalizada', updated_at: new Date() },
      });

      await tx.ubicacion_actual.deleteMany({ where: { ruta_id: rutaId } });
    });

    await this.redis.clearRouteData(rutaId);

    return {
      success: true,
      message: 'Ruta finalizada y trayectoria procesada.',
    };
  }
}
