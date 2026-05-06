export interface ActiveOperation {
  id_ruta: string;
  unidad: string;      // Modelo + Placas
  chofer: string;      // Nombre completo del conductor
  ruta_nombre: string; // Nombre o destino de la ruta
  progreso: number;    // % de avance basado en pedidos entregados
  ultima_conexion: Date;
  estatus: 'en_movimiento' | 'detenido' | 'incidencia';
}