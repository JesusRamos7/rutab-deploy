// /frontend/src/features/road-incidents/hooks/useRoadIncidents.ts

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { roadIncidentsService } from '../services/road-incidents.service';
import { Incident } from '../types/road-incidents.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useRoadIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIncidents = async () => {
    try {
      // 1. Verificamos el token antes de la llamada
      const token = await AsyncStorage.getItem('@usuario_chofer');

      if (!token) {
        console.warn('No hay token disponible. Redirigiendo al login...');
        // Aquí podrías disparar una lógica de navegación al login
        return;
      }

      const data = await roadIncidentsService.getAll();
      setIncidents(data);
    } catch (error: any) {
      // Si el error es 401, el token expiró definitivamente
      if (error.response?.status === 401) {
        console.error('Sesión expirada. 401 Unauthorized');
        AsyncStorage.removeItem('@usuario_chofer');
      }
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchIncidents();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchIncidents();
  };

  const deleteIncident = async (id: string) => {
    try {
      await roadIncidentsService.delete(id);
      setIncidents((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el reporte.');
    }
  };

  return { incidents, loading, refreshing, onRefresh, deleteIncident };
};
