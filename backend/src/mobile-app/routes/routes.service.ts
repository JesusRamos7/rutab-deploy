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
    // Obtenemos la fecha actual en formato YYYY-MM-DD para filtrar
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 1. Buscamos la ruta filtrando OBLIGATORIAMENTE por chofer_id
    const ruta = await this.prisma.rutas.findFirst({
      where: {
        chofer_id: choferId, // <--- FILTRO CRÍTICO: Solo lo que le pertenece
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
      },
    });

    if (!ruta) {
      throw new NotFoundException('No tienes ninguna ruta asignada para hoy.');
    }

    // 2. Al usar el ID de la ruta obtenida arriba, garantizamos que los pedidos
    // también sean los correctos.
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
    // Verificamos que la ruta a iniciar pertenezca al chofer que envía la petición
    const ruta = await this.prisma.rutas.findFirst({
      where: {
        id: rutaId,
        chofer_id: choferId, // <--- SEGURIDAD: Evita que un chofer inicie la ruta de otro
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
    // 1. Validamos que la ruta pertenezca al chofer y esté en proceso
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

    // 2. Persistencia en REDIS (Historial para el trayecto final)
    await this.redis.pushLocation(dto.rutaId, dto);

    // 3. Persistencia en POSTGRESQL (Ubicación actual para el monitor en vivo)
    // Usamos $executeRaw para manejar el tipo GEOGRAPHY de PostGIS
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
}
