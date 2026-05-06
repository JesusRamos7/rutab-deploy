import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class FailedDeliveriesService {
  constructor(private prisma: PrismaService) {}

  async getFailedOrders() {
    const orders = await this.prisma.pedidos.findMany({
      where: {
        estado_pedido: 'fallido',
      },
      include: {
        clientes: {
          // Corregido a plural según tu esquema
          select: {
            nombre: true,
            telefono: true,
            direccion: true,
            correo: true,
            codigo: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Mapeo de datos esenciales para el CSV/Visualización
    return orders.map((order) => ({
      codigo_rastreo: order.codigo_rastreo,
      descripcion: order.descripcion_carga || 'Sin descripción',
      fecha: order.created_at,
      cliente: order.clientes?.nombre || 'N/A',
      telefono: order.clientes?.telefono || 'N/A',
      direccion: order.clientes?.direccion || 'N/A',
      correo_cliente: order.clientes?.correo || 'N/A',
      codigo_cliente: order.clientes?.codigo || 'N/A',
    }));
  }

  async markAsExtracted(codigosRastreo: string[]) {
    if (!codigosRastreo || codigosRastreo.length === 0) {
      throw new BadRequestException(
        'No se proporcionaron códigos de rastreo para actualizar.',
      );
    }

    try {
      const result = await this.prisma.pedidos.updateMany({
        where: {
          codigo_rastreo: {
            in: codigosRastreo, // Actualiza todos los pedidos que coincidan con este array
          },
          estado_pedido: 'fallido', // Medida de seguridad: solo actualiza si siguen siendo 'fallidos'
        },
        data: {
          estado_pedido: 'extraido_fallido', // El nuevo estado. Puedes cambiar el nombre si prefieres.
        },
      });

      return {
        message: 'Pedidos actualizados correctamente',
        count: result.count,
      };
    } catch (error) {
      throw new BadRequestException(
        'Error al actualizar el estado de los pedidos.',
      );
    }
  }
}
