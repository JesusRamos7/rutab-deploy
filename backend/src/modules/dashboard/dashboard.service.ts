// src/modules/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getDailyStats() {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const [rutasActivas, pedidosStats, rawIncidencias] = await Promise.all([
            // Rutas activas hoy
            this.prisma.rutas.count({
                where: {
                    created_at: { gte: today },
                    estatus_ruta: 'en_proceso'
                }
            }),

            // Conteo de pedidos por estado hoy
            this.prisma.pedidos.groupBy({
                by: ['estado_pedido'],
                where: { created_at: { gte: today } },
                _count: true
            }),

            this.prisma.incidencias.findMany({
                where: {
                    created_at: { gte: today }
                },
                include: {
                    rutas: { include: { vehiculos: true } }
                }
            })
        ]);

        // Agrupamos para el monitor del dashboard
        const incidenciasCategorizadas = {
            camino: rawIncidencias.filter(i => i.categoria === 'camino'),
            entrega: rawIncidencias.filter(i => i.categoria === 'entrega'),
            tiempo: rawIncidencias.filter(i => i.categoria === 'tiempo'),
        };

        // Procesamos el array de groupBy para el DTO
        const counts = {
            totales: pedidosStats.reduce((acc, p) => acc + p._count, 0),
            entregados: pedidosStats.find(p => p.estado_pedido === 'entregado')?._count || 0,
            cancelados: pedidosStats.find(p => p.estado_pedido === 'cancelado')?._count || 0,
            fallidos: pedidosStats.find(p => p.estado_pedido === 'fallido')?._count || 0,
        };

        return {
            rutasActivas,
            pedidos: {
                ...counts,
                enRuta: counts.totales - (counts.entregados + counts.cancelados + counts.fallidos)
            },
            incidenciasHoy: rawIncidencias.length,
            monitorIncidencias: incidenciasCategorizadas
        };
    }

    async getActiveOperations() {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const rutas = await this.prisma.rutas.findMany({
            where: {
                created_at: { gte: today },
                estatus_ruta: 'en_proceso'
            },
            include: {
                vehiculos: true,
                choferes: true,
                detalles_ruta: {
                    include: {
                        pedidos: true
                    }
                }
            }
        });

        return rutas.map(ruta => {
            const totalPedidos = ruta.detalles_ruta.length;

            const entregados = ruta.detalles_ruta.filter(
                d => d.pedidos?.estado_pedido === 'entregado' || d.pedidos?.estado_pedido === 'completado'
            ).length;

            const fallidos = ruta.detalles_ruta.filter(
                d => d.pedidos?.estado_pedido === 'fallido' || d.pedidos?.estado_pedido === 'cancelado'
            ).length;

            const enRuta = totalPedidos - (entregados + fallidos);

            return {
                id_ruta: ruta.id,
                rutaId: ruta.id, // Lo necesitamos para el socket de monitoreo
                unidad: `${ruta.vehiculos?.modelo || 'S/M'} - ${ruta.vehiculos?.placas || 'S/P'}`,
                chofer: ruta.choferes?.nombre || 'Sin asignar',
                ruta_nombre: `Ruta #${ruta.id.substring(0, 5)}`,
                progreso: totalPedidos > 0 ? Math.round((entregados / totalPedidos) * 100) : 0,
                estatus: ruta.estatus_ruta === 'en_proceso' ? 'en_movimiento' : 'detenido',

                stats: {
                    total: totalPedidos,
                    entregados,
                    fallidos,
                    enTransito: enRuta > 0 ? enRuta : 0
                }
            };
        });
    }
}