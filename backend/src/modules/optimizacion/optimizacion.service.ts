// /backend/src/modules/optimizacion/optimizacion.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { GoogleMapsService } from './google-maps.service';
import {
  PuntoPedido,
  PublicarRutaDto,
  DetalleRutaOrdenado,
} from './dto/optimizacion.dto';

@Injectable()
export class OptimizacionService {
  constructor(
    private prisma: PrismaService,
    private googleService: GoogleMapsService,
  ) {}

  async generarSugerenciaClusters(vehiculoId: string, fecha: string) {
    const pedidos = await this.prisma.$queryRaw<PuntoPedido[]>`
      SELECT p.id, c.nombre as cliente, 
             ST_Y(c.coordenadas::geometry) as lat, ST_X(c.coordenadas::geometry) as lng
      FROM pedidos p
      JOIN clientes c ON p.cliente_id = c.id
      JOIN detalles_ruta dr ON p.id = dr.pedido_id
      JOIN rutas r ON dr.ruta_id = r.id
      WHERE r.vehiculo_id = ${vehiculoId}::uuid AND r.fecha_programada = ${fecha}::date
    `;

    if (pedidos.length === 0) return [];
    return this.ejecutarKMeans(pedidos, Math.ceil(pedidos.length / 20));
  }

  async publicarRuta(dto: PublicarRutaDto) {
    return await this.prisma.$transaction(async (tx) => {
      // Obtenemos la ruta para conocer su fecha programada base
      const rutaActual = await tx.rutas.findUnique({
        where: { id: dto.rutaId },
      });

      // Calculamos la fecha estimada de llegada sumando los segundos de Google
      const tiempoEstimado = new Date(rutaActual.fecha_programada);
      tiempoEstimado.setSeconds(
        tiempoEstimado.getSeconds() + dto.duracionTotalSegundos,
      );

      // 1. Actualizar cabecera con metadatos reales
      await tx.rutas.update({
        where: { id: dto.rutaId },
        data: {
          estatus_ruta: 'programada',
          distancia_total_estimada: dto.distanciaTotalMetros / 1000, // Guardamos en KM
          tiempo_estimado_entrega: tiempoEstimado,
        },
      });

      // 2. Actualizar orden de cada pedido
      for (let i = 0; i < dto.ordenFinalPedidos.length; i++) {
        await tx.detalles_ruta.updateMany({
          where: { ruta_id: dto.rutaId, pedido_id: dto.ordenFinalPedidos[i] },
          data: { orden_entrega: i + 1 },
        });
      }

      return { success: true };
    });
  }

  private ejecutarKMeans(puntos: PuntoPedido[], k: number) {
    let centroides = puntos
      .sort(() => 0.5 - Math.random())
      .slice(0, k)
      .map((p) => ({ lat: p.lat, lng: p.lng }));
    let clusters = [];
    for (let i = 0; i < 20; i++) {
      // 20 iteraciones para convergencia
      clusters = centroides.map((c, idx) => ({
        clusterId: idx,
        centroide: c,
        pedidos: [],
      }));
      puntos.forEach((p) => {
        let dMin = Infinity,
          idx = 0;
        centroides.forEach((c, cIdx) => {
          const d = Math.sqrt((p.lat - c.lat) ** 2 + (p.lng - c.lng) ** 2);
          if (d < dMin) {
            dMin = d;
            idx = cIdx;
          }
        });
        clusters[idx].pedidos.push(p);
      });
      centroides = clusters.map((c) => {
        if (c.pedidos.length === 0) return c.centroide;
        return {
          lat: c.pedidos.reduce((a, b) => a + b.lat, 0) / c.pedidos.length,
          lng: c.pedidos.reduce((a, b) => a + b.lng, 0) / c.pedidos.length,
        };
      });
    }
    return clusters;
  }
}
