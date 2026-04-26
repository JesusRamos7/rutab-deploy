// /frontend/src/features/road-incidents/hooks/useRoadIncidents.ts

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { roadIncidentsService } from '../services/road-incidents.service';
import { Incident } from '../types/road-incidents.types';

export const useRoadIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIncidents = async () => {
    try {
      const data = await roadIncidentsService.getAll();
      setIncidents(data);
    } catch (error) {
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
