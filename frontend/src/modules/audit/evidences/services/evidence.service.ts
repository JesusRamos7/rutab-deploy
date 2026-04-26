// src/modules/management/evidences/services/evidence.service.ts
import { api } from "../../../../config/api";
import { Evidence, EvidenceFilters } from "../types/evidence.types";

const BASE_URL = "/management/evidences";

export const EvidenceService = {
  /**
   * Obtiene la lista de evidencias.
   * Las URLs de fotos y firmas ya vienen firmadas por el backend.
   */
  getAll: async (filters: EvidenceFilters): Promise<Evidence[]> => {
    const { data } = await api.get<Evidence[]>(BASE_URL, { params: filters });
    return data;
  },

  /**
   * Aprueba manualmente una evidencia
   */
  approve: async (id: string): Promise<void> => {
    await api.patch(`${BASE_URL}/${id}/approve`);
  },
};
