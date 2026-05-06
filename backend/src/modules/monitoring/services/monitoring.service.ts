// src/modules/monitoring/services/monitoring.service.ts
import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { RedisService } from '../../../mobile-app/redis/redis.service';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { MonitoringGateway } from '../gateways/monitoring.gateway';

@Injectable()
export class MonitoringService {
  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => MonitoringGateway))
    private readonly monitoringGateway: MonitoringGateway,
  ) {}

  async getActiveFleetStatus() {
    // Consulta optimizada con PostGIS para el estado de la flota
    const fleet: any[] = await this.prisma.$queryRaw`
      SELECT 
        r.id AS "rutaId",
        v.placas,
        c.nombre AS "driverName",
        ST_X(u.ultima_coordenada::geometry) AS longitud,
        ST_Y(u.ultima_coordenada::geometry) AS latitud,
        u.velocidad_kmh AS speed,
        u.nivel_bateria AS fuel,
        u.fecha_actualizacion AS "lastUpdate",
        r.tiempo_estimado_entrega AS eta
      FROM public.rutas r
      JOIN public.vehiculos v ON r.vehiculo_id = v.id
      JOIN public.choferes c ON r.chofer_id = c.id
      LEFT JOIN public.ubicacion_actual u ON r.id = u.ruta_id
      WHERE r.estatus_ruta = 'en_proceso'
    `;

    const fleetStatus = await Promise.all(
      fleet.map(async (item) => {
        // Obtenemos el desglose de pedidos de la ruta
        const detalles = await this.prisma.detalles_ruta.findMany({
          where: { ruta_id: item.rutaId },
          include: { 
            pedidos: { 
              include: { clientes: true } 
            } 
          },
        });

        const total = detalles.length;
        const entregados = detalles.filter(d => d.pedidos?.estado_pedido === 'entregado').length;
        const enTransito = detalles.filter(d => d.pedidos?.estado_pedido === 'en_transito').length;
        const cancelados = detalles.filter(d => d.pedidos?.estado_pedido === 'cancelado').length;
        const fallidos = detalles.filter(d =>
          d.pedidos?.estado_pedido === 'fallido' || d.pedidos?.estado_pedido === 'cancelado'
        ).length;

        const proximo = detalles
          .sort((a, b) => a.orden_entrega - b.orden_entrega)
          .find(d => d.pedidos?.estado_pedido === 'en_transito');

        return {
          id: item.placas || 'S/N',
          driverName: item.driverName || 'Sin asignar',
          currentLocation: item.latitud 
            ? `Lat: ${item.latitud.toFixed(4)}, Lng: ${item.longitud.toFixed(4)}`
            : 'Sin señal GPS',
          speed: item.speed || 0,
          fuel: item.fuel || 0,
          // Métricas que pediste para el panel
          stats: {
            total,
            entregados,
            enTransito,
            cancelados,
            fallidos,
          },
          stops: `${entregados}/${total}`,
          eta: item.eta
            ? new Date(item.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '--:--',
          nextPoint: proximo?.pedidos?.clientes?.nombre || 'Fin de ruta',
          status: item.latitud ? 'En ruta' : 'Desconectado',
          latitud: item.latitud,
          longitud: item.longitud,
          rutaId: item.rutaId,
        };
      }),
    );

    return fleetStatus;
  }

  async saveLocation(data: UpdateLocationDto) {
    // Guardar en PostgreSQL (Estado actual)
    await this.prisma.$executeRaw`
      INSERT INTO public.ubicacion_actual (ruta_id, ultima_coordenada, velocidad_kmh, nivel_bateria, fecha_actualizacion)
      VALUES (
        ${data.rutaId}::uuid, 
        ST_SetSRID(ST_MakePoint(${data.longitud}, ${data.latitud}), 4326)::geography, 
        ${data.velocidad}, 
        NOW()
      )
      ON CONFLICT (ruta_id) DO UPDATE SET
        ultima_coordenada = EXCLUDED.ultima_coordenada,
        velocidad_kmh = EXCLUDED.velocidad_kmh,
        nivel_bateria = EXCLUDED.nivel_bateria,
        fecha_actualizacion = NOW();
    `;

    // Guardar en Redis (Historial)
    await this.redisService.pushLocation(data.rutaId, {
      latitude: data.latitud,
      longitude: data.longitud,
      velocidad: data.velocidad,
    });

    // Emitimos a la sala específica de la ruta y también un evento global
    this.monitoringGateway.server.emit('fleetUpdate', {
        rutaId: data.rutaId,
        latitud: data.latitud,
        longitud: data.longitud,
        velocidad: data.velocidad
    });
  }
}