// backend/src/mobile-app/routes/routes.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async getActiveRoute(choferId: string) {
    // 1. Buscamos la ruta que esté programada o ya en proceso
    const ruta = await this.prisma.rutas.findFirst({
      where: {
        chofer_id: choferId,
        estatus_ruta: { in: ['programada', 'en_proceso'] }, // Aceptamos ambos estados
      },
      select: {
        id: true,
        fecha_programada: true,
        estatus_ruta: true, // Importante para que el frontend sepa si mostrar el botón
        vehiculos: {
          select: { placas: true, marca: true, modelo: true },
        },
      },
    });

    if (!ruta) {
      throw new NotFoundException('No tienes una ruta activa asignada.');
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
    // Verificamos que la ruta exista, pertenezca al chofer y esté programada
    const ruta = await this.prisma.rutas.findFirst({
      where: {
        id: rutaId,
        chofer_id: choferId,
        estatus_ruta: 'programada',
      },
    });

    if (!ruta) {
      throw new BadRequestException('La ruta no existe o ya ha sido iniciada.');
    }

    // Actualizamos el estado
    return this.prisma.rutas.update({
      where: { id: rutaId },
      data: {
        estatus_ruta: 'en_proceso',
        updated_at: new Date(),
      },
    });
  }
}
