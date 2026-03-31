// /frontend/src/modules/optimizacion/types/optimizacion.types.ts

export interface PuntoPedido {
  id: string;
  cliente: string;
  lat: number;
  lng: number;
}

export interface ClusteringRequest {
  vehiculoId: string;
  fechaProgramada: string;
}

export interface ClusterResponse {
  clusterId: number;
  centroide: { lat: number; lng: number };
  pedidos: PuntoPedido[];
}

export interface DetalleRutaOrdenado {
  pedidos: PuntoPedido[];
  distanciaMetros: number;
  duracionSegundos: number;
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
