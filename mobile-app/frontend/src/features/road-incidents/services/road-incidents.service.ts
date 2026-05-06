// /frontend/src/features/road-incidents/services/road-incidents.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../../../core/api/apiClient';

export const roadIncidentsService = {
  getAll: async () => {
    // Recuperamos el token manualmente para asegurar que no vaya vacío
    const token = await AsyncStorage.getItem('@token_chofer'); 
    
    const { data } = await apiClient.get('/mobile-app/evidence/incidents', {
      headers: {
        Authorization: `Bearer ${token}` // Forzamos el envío
      }
    });
    return data;
  },

  create: async (formData: FormData) => {
    // Recuperamos el token manualmente para asegurar que no vaya vacío
    const token = await AsyncStorage.getItem('@token_chofer');    
    // Verificamos si el token va en el Authorization header
    console.log('Auth Header:', apiClient.defaults.headers.common['Authorization']);

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
