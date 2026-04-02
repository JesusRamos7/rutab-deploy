// src/mobile-app/routes/routes.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async getActiveRoute(choferId: string) {
    // 1. Buscamos la ruta activa asignada al chofer
    const ruta = await this.prisma.rutas.findFirst({
      where: {
        chofer_id: choferId,
        estatus_ruta: 'programada', // O el estado que definas como activo
      },
      select: {
        id: true,
        fecha_programada: true,
        vehiculos: {
          select: { placas: true, marca: true, modelo: true },
        },
      },
    });

    if (!ruta) {
      throw new NotFoundException('No tienes una ruta activa asignada.');
    }

    // 2. Usamos queryRaw para traer los pedidos con sus coordenadas PostGIS
    // Prisma no soporta Geography nativamente, así que extraemos Lat/Lng manualmente
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
      ORDER BY dr.orden_entrega ASC
    `;

    return {
      ...ruta,
      pedidos,
    };
  }
}
