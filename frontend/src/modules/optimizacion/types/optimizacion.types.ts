// /frontend/src/modules/optimizacion/types/optimizacion.types.ts

/**
 * Estructura básica para la representación de puntos geográficos.
 */
export interface Coordenadas {
  lat: number;
  lng: number;
}

/**
 * Información técnica y de contacto de un punto de entrega.
 * Incluye coordenadas para su posicionamiento en el mapa y cálculos de ruta.
 */
export interface PuntoPedido {
  id: string;
  cliente: string;
  codigoRastreo: string;
  lat: number;
  lng: number;
}

/**
 * Parámetros necesarios para iniciar la agrupación automática de pedidos.
 */
export interface ClusteringRequest {
  vehiculoId: string;
  fechaProgramada: string;
}

/**
 * Respuesta del servidor que contiene un grupo de pedidos y su punto central geográfico.
 */
export interface ClusterResponse {
  clusterId: number;
  centroide: Coordenadas;
  pedidos: PuntoPedido[];
}

/**
 * Resultado de la optimización de un grupo, incluyendo el orden de visita y métricas estimadas.
 */
export interface DetalleRutaOrdenado {
  pedidos: PuntoPedido[];
  distanciaMetros: number;
  duracionSegundos: number;
}

/**
 * Parámetros para solicitar el ordenamiento de un grupo específico.
 * Permite definir puntos de inicio y fin para conectar múltiples grupos de forma lógica.
 */
export interface OrdenarClusterRequest {
  pedidos: PuntoPedido[];
  inicio?: Coordenadas;
  fin?: Coordenadas;
}

/**
 * Lista de centroides utilizada para determinar la secuencia de visita entre diferentes grupos.
 */
export interface OrdenClustersRequest {
  centroides: {
    clusterId: number;
    lat: number;
    lng: number;
  }[];
}

/**
 * Objeto de transferencia para la persistencia final de la ruta.
 * Contiene la secuencia definitiva de IDs y los totales de distancia y tiempo.
 */
export interface PublicarRutaDto {
  rutaId: string;
  ordenFinalPedidos: string[];
  distanciaTotalMetros: number;
  duracionTotalSegundos: number;
}
