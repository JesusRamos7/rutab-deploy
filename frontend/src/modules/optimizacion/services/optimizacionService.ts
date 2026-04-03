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
 * Interfaz para la nueva estructura de petición de ordenamiento por cluster.
 */
interface OrdenarClusterParams {
  pedidos: PuntoPedido[];
  inicio?: { lat: number; lng: number };
  fin?: { lat: number; lng: number };
}

export const optimizacionService = {
  /**
   * PASO 1: Obtiene la sugerencia inicial de grupos (K-Means).
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
   * PASO 2 (Actualizado): Envía los pedidos junto con puntos de inicio/fin opcionales
   * para permitir el encadenamiento de rutas.
   */
  ordenarCluster: async (
    params: OrdenarClusterParams,
  ): Promise<DetalleRutaOrdenado> => {
    const response = await api.post<DetalleRutaOrdenado>(
      "/optimizacion/ordenar-cluster",
      params, // Ahora enviamos el objeto completo
    );
    return response.data;
  },

  /**
   * PASO 3: Obtiene el orden propuesto para visitar los distintos clusters.
   * Ahora consume una lógica matemática local en el backend ($0 costo).
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
   * PASO 4: Publica la ruta definitiva y guarda los cambios en la base de datos.
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
   * Obtiene las rutas en estado borrador.
   */
  obtenerRutasPendientes: async (): Promise<RutaPendiente[]> => {
    const response = await api.get<RutaPendiente[]>(
      "/optimizacion/rutas-pendientes",
    );
    return response.data;
  },
};
