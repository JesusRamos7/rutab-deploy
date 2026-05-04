// /frontend/src/features/road-incidents/hooks/useRoadIncidents.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { roadIncidentsService } from '../services/road-incidents.service';
import { Incident } from '../types/road-incidents.types';
import { getErrorMessage } from '../../../core/api/apiClient'; // Importamos el helper global

export const useRoadIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Referencia para evitar actualizaciones en componentes desmontados
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchIncidents = async () => {
    try {
      // Solo activamos loading si no estamos refrescando manualmente (pull-to-refresh)
      if (!refreshing) setLoading(true);
      setError(null);

      const data = await roadIncidentsService.getAll();

      if (isMounted.current) {
        setIncidents(data || []);
      }
    } catch (err: any) {
      if (isMounted.current) {
        const message = getErrorMessage(err);
        setError(message);
        console.error('Error fetching incidents:', message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  // Se dispara cada vez que la pantalla gana el foco
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

      if (isMounted.current) {
        setIncidents((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err: any) {
      // Aquí usamos el helper para dar un feedback real al chofer
      const message = getErrorMessage(err);
      Alert.alert('No se pudo eliminar', message);
    }
  };

  return {
    incidents,
    loading,
    refreshing,
    error, // Exportamos el error para la UI
    onRefresh,
    deleteIncident,
  };
};
