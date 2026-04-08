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
}
