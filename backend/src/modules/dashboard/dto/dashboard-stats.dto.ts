export class DashboardStatsDto {
  rutasActivas: number;
  pedidos: {
    totales: number;
    entregados: number;
    fallidos: number;
    enRuta: number;
  };
  incidenciasHoy: number;
  unidadesOperando: number;
  alertasCriticas: number; 
}