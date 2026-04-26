// /frontend/src/features/road-incidents/services/road-incidents.service.ts

import { apiClient } from '../../../core/api/apiClient';

export const roadIncidentsService = {
  getAll: async () => {
    const { data } = await apiClient.get('/mobile-app/evidence/incidents');
    return data;
  },

  create: async (formData: FormData) => {
    return await apiClient.post('/mobile-app/evidence/incident', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update: async (
    id: string,
    updateData: { tipo: string; descripcion: string; estado_incidencia: string }
  ) => {
    return await apiClient.patch(`/mobile-app/evidence/incident/${id}`, updateData);
  },

  delete: async (id: string) => {
    return await apiClient.delete(`/mobile-app/evidence/incident/${id}`);
  },
};
