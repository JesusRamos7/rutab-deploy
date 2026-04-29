import { api } from "../../../../config/api";
import { Incident, IncidentFilters } from "../types/incident.types";

export const incidentService = {
  /**
   * Obtiene la lista de incidencias aplicando los filtros proporcionados.
   */
  getAll: async (filters: IncidentFilters): Promise<Incident[]> => {
    // Limpiamos los filtros vacíos o nulos antes de enviarlos
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v != null && v !== ""),
    );
    const { data } = await api.get<Incident[]>("/incidents", {
      params: cleanFilters,
    });
    return data;
  },

  /**
   * Actualiza el estado de una incidencia específica.
   */
  updateStatus: async (id: string, estado: string): Promise<void> => {
    await api.patch(`/incidents/${id}/status`, { estado });
  },
};
