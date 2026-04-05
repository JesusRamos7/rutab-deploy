// /frontend/src/modules/optimizacion/services/optimizacionService.ts

import { api } from "../../../config/api";
import { RutaPendiente } from "../pages/SeleccionVehiculoPage";
import {
  ClusteringRequest,
  ClusterResponse,
  PuntoPedido,
  DetalleRutaOrdenado,
  OrdenClustersRequest,
  PublicarRutaDto,
} from "../types/optimizacion.types";

/**
 * Parámetros requeridos para solicitar el ordenamiento de paradas dentro de un grupo.
 */
interface OrdenarClusterParams {
  pedidos: PuntoPedido[];
  inicio?: { lat: number; lng: number };
  fin?: { lat: number; lng: number };
}

/**
 * Servicio encargado de la comunicación con el backend para los procesos de
 * geolocalización y optimización de rutas logísticas.
 */
export const optimizacionService = {
  /**
   * Fase 1: Solicita al servidor una agrupación inicial de pedidos basada en proximidad.
   */
  sugerirClusters: async (
    data: ClusteringRequest,
  ): Promise<ClusterResponse[]> => {
    const response = await api.post<ClusterResponse[]>(
      "/optimizacion/sugerir-clusters",
      data,
    );
    return response.data;
  },

  /**
   * Fase 2: Envía un subgrupo de pedidos para calcular la secuencia de entrega más eficiente.
   * Soporta puntos de inicio y fin específicos para permitir el encadenamiento entre grupos.
   */
  ordenarCluster: async (
    params: OrdenarClusterParams,
  ): Promise<DetalleRutaOrdenado> => {
    const response = await api.post<DetalleRutaOrdenado>(
      "/optimizacion/ordenar-cluster",
      params,
    );
    return response.data;
  },

  /**
   * Fase 3: Determina el orden lógico para visitar los diferentes grupos (clusters) generados.
   * Utiliza una lógica de optimización de proximidad procesada en el backend.
   */
  proponerOrdenClusters: async (
    data: OrdenClustersRequest,
  ): Promise<number[]> => {
    const response = await api.post<number[]>(
      "/optimizacion/proponer-orden-clusters",
      data,
    );
    return response.data;
  },

  /**
   * Fase 4: Registra de forma definitiva la ruta optimizada en la base de datos.
   */
  publicarRuta: async (
    data: PublicarRutaDto,
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await api.patch<{ success: boolean; message?: string }>(
      "/optimizacion/publicar",
      data,
    );
    return response.data;
  },

  /**
   * Recupera el listado de rutas en estado borrador, permitiendo filtros por texto o fecha.
   */
  obtenerRutasPendientes: async (
    busqueda?: string,
    fecha?: string,
  ): Promise<RutaPendiente[]> => {
    const response = await api.get<RutaPendiente[]>(
      "/optimizacion/rutas-pendientes",
      {
        params: { busqueda, fecha },
      },
    );
    return response.data;
  },
};
