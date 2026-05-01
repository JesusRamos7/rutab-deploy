// src/modules/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getDailyStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [rutasActivas, pedidosStats, incidenciasHoy] = await Promise.all([
            // Rutas activas hoy
            this.prisma.rutas.count({
                where: {
                    created_at: { gte: today },
                    estatus_ruta: 'en_transito'
                }
            }),

            // Conteo de pedidos por estado hoy
            this.prisma.pedidos.groupBy({
                by: ['estado_pedido'],
                where: { created_at: { gte: today } },
                _count: true
            }),

            // Incidencias reportadas hoy
            this.prisma.incidencias.count({
                where: { created_at: { gte: today } }
            })
        ]);

        // Procesamos el array de groupBy para el DTO
        const counts = {
            totales: pedidosStats.reduce((acc, p) => acc + p._count, 0),
            entregados: pedidosStats.find(p => p.estado_pedido === 'completado')?._count || 0,
            cancelados: pedidosStats.find(p => p.estado_pedido === 'Cancelado')?._count || 0,
        };

        return {
            rutasActivas,
            pedidos: {
                ...counts,
                enRuta: counts.totales - (counts.entregados + counts.cancelados)
            },
            incidenciasHoy
        };
    }

    async getActiveOperations() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const rutas = await this.prisma.rutas.findMany({
            where: {
                created_at: { gte: today },
                // Filtramos por rutas que ya no sean simples borradores
                estatus_ruta: { not: 'borrador' }
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
            // Calculamos entregados basándonos en el estado del pedido vinculado
            const entregados = ruta.detalles_ruta.filter(
                d => d.pedidos?.estado_pedido === 'completado'
            ).length;

            return {
                id_ruta: ruta.id,
                // Usamos el modelo y placas de vehiculos
                unidad: `${ruta.vehiculos?.modelo || 'S/M'} - ${ruta.vehiculos?.placas || 'S/P'}`,
                chofer: ruta.choferes?.nombre || 'Sin asignar',
                ruta_nombre: `Ruta #${ruta.id.substring(0, 5)}`,
                progreso: totalPedidos > 0 ? Math.round((entregados / totalPedidos) * 100) : 0,
                estatus: ruta.estatus_ruta === 'en_transito' ? 'en_movimiento' : 'detenido'
            };
        });
    }
}