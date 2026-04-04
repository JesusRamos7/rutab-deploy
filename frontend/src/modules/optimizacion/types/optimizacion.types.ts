// /frontend/src/modules/optimizacion/types/optimizacion.types.ts

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface PuntoPedido {
  id: string;
  cliente: string;
  codigoRastreo: string;
  lat: number;
  lng: number;
}

export interface ClusteringRequest {
  vehiculoId: string;
  fechaProgramada: string;
}

export interface ClusterResponse {
  clusterId: number;
  centroide: Coordenadas;
  pedidos: PuntoPedido[];
}

export interface DetalleRutaOrdenado {
  pedidos: PuntoPedido[];
  distanciaMetros: number;
  duracionSegundos: number;
}

/**
 * Nueva interfaz para la petición de ordenamiento encadenado
 */
export interface OrdenarClusterRequest {
  pedidos: PuntoPedido[];
  inicio?: Coordenadas;
  fin?: Coordenadas;
}

export interface OrdenClustersRequest {
  centroides: {
    clusterId: number;
    lat: number;
    lng: number;
  }[];
}

export interface PublicarRutaDto {
  rutaId: string;
  ordenFinalPedidos: string[];
  distanciaTotalMetros: number;
  duracionTotalSegundos: number;
}
