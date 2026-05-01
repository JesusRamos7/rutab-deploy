export class DashboardStatsDto {
  rutasActivas: number;
  pedidos: {
    totales: number;
    entregados: number;
    cancelados: number;
    enRuta: number;
  };
  incidenciasHoy: number;
  unidadesOperando: number;
}