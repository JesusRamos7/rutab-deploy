export interface DashboardStats {
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

export interface ActiveOperation {
  id_ruta: string;
  unidad: string;
  chofer: string;
  ruta_nombre: string;
  progreso: number;
  estatus: 'en_movimiento' | 'detenido' | 'incidencia';
}