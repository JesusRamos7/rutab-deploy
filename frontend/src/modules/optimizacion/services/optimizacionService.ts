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
 * Servicio para interactuar con los endpoints de optimización de rutas.
 */
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
   * PASO 2: Solicita a Google el orden lógico de los pedidos dentro de un cluster.
   */
  ordenarCluster: async (
    pedidos: PuntoPedido[],
  ): Promise<DetalleRutaOrdenado> => {
    const response = await api.post<DetalleRutaOrdenado>(
      "/optimizacion/ordenar-cluster",
      pedidos,
    );
    return response.data;
  },

  /**
   * PASO 3: Obtiene el orden propuesto para visitar los distintos clusters.
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
   * Obtiene las rutas en estado borrador desde la base de datos.
   */
  obtenerRutasPendientes: async (): Promise<RutaPendiente[]> => {
    const response = await api.get<RutaPendiente[]>(
      "/optimizacion/rutas-pendientes",
    );
    return response.data;
  },
};
