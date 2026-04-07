// /backend/src/modules/optimization/interfaces/google-maps.interface.ts

/**
 * Estructura de respuesta parcial de la API de Google Directions.
 * Se utiliza para procesar el ordenamiento óptimo de paradas y métricas de trayecto.
 */
export interface GoogleDirectionsResponse {
  routes: {
    /** Secuencia de índices que define el orden de entrega más eficiente para los puntos intermedios */
    waypoint_order: number[];
    /** Información detallada sobre cada tramo de la ruta, incluyendo distancias y tiempos de viaje */
    legs: any[];
  }[];
  /** Estado de la transacción devuelto por el servicio (ej. "OK", "ZERO_RESULTS") */
  status: string;
}
