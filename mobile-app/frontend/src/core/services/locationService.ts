// /mobile-app/frontend/src/core/services/locationService.ts

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/apiClient';

const LOCATION_TRACKING_TASK = 'BACKGROUND_LOCATION_TRACKING';
const OFFLINE_STORAGE_KEY = '@offline_locations';
const LAST_LOCATION_KEY = '@last_sent_location';

/**
 * Calcula la distancia en metros entre dos coordenadas (Fórmula Haversine)
 */
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Radio de la tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
/**
 * Definición de la tarea en segundo plano.
 * DEBE definirse en el ámbito global (fuera de cualquier componente/clase).
 */
TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }: any) => {
  if (error || !data) return;

  const { locations } = data;
  const [location] = locations;

  if (location) {
    const { latitude, longitude, speed } = location.coords;
    const rutaId = await AsyncStorage.getItem('@active_ruta_id');
    if (!rutaId) return;

    // --- FILTRO DE MOVIMIENTO MÍNIMO ---
    const lastLocationStr = await AsyncStorage.getItem(LAST_LOCATION_KEY);
    if (lastLocationStr) {
      const lastLoc = JSON.parse(lastLocationStr);
      const distance = getDistance(latitude, longitude, lastLoc.lat, lastLoc.lng);

      // Si se movió menos de 1 metros Y la velocidad es casi nula, ignoramos el envío
      // pero actualizamos el timestamp local para evitar estancamiento
      if (distance < 1 && (speed || 0) < 0.5) {
        return;
      }
    }

    const payload = {
      rutaId,
      latitude,
      longitude,
      velocidad: speed ? Math.round(speed * 3.6) : 0,
    };

    try {
      await apiClient.post('/mobile-app/routes/tracking', payload);
      // Guardamos esta como la última ubicación exitosa
      await AsyncStorage.setItem(
        LAST_LOCATION_KEY,
        JSON.stringify({ lat: latitude, lng: longitude })
      );
      await flushOfflineLocations();
    } catch (err) {
      await saveLocationOffline(payload);
    }
  }
});

/**
 * Guarda ubicaciones en local cuando no hay conexión.
 */
const saveLocationOffline = async (payload: any) => {
  try {
    const existing = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY);
    const locations = existing ? JSON.parse(existing) : [];
    locations.push({ ...payload, timestamp: new Date().toISOString() });
    await AsyncStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(locations));
  } catch (e) {
    console.error('Error guardando offline:', e);
  }
};

/**
 * Intenta enviar los puntos acumulados en local al servidor.
 */
const flushOfflineLocations = async () => {
  try {
    const existing = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!existing) return;

    const locations = JSON.parse(existing);
    if (locations.length === 0) return;

    // Enviamos el lote de puntos (el backend debería estar preparado para recibir arreglos,
    // pero por ahora los enviamos uno a uno o puedes ajustar el endpoint)
    for (const loc of locations) {
      await apiClient.post('/mobile-app/routes/tracking', loc);
    }

    await AsyncStorage.removeItem(OFFLINE_STORAGE_KEY);
  } catch (e) {
    console.warn('Fallo al vaciar buffer offline:', e);
  }
};

/**
 * Servicio exportable para controlar el tracking desde la UI.
 */
export const LocationService = {
  async startTracking(rutaId: string) {
    try {
      await AsyncStorage.setItem('@active_ruta_id', rutaId);
      // Limpiamos la última ubicación para forzar el primer envío
      await AsyncStorage.removeItem(LAST_LOCATION_KEY);

      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') throw new Error('Permiso de GPS denegado');

      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== 'granted') throw new Error('Permiso de GPS en segundo plano denegado');

      const isStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING_TASK);
      if (isStarted) return;

      await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60000,
        distanceInterval: 1, // Filtro nativo de Android/iOS (mínimo 15 metros)
        foregroundService: {
          notificationTitle: 'Ruta en Progreso',
          notificationBody: 'Tu ubicación se está compartiendo con la central.',
          notificationColor: '#123a5d',
        },
      });
    } catch (error) {
      console.error('Error al iniciar tracking:', error);
      throw error;
    }
  },

  async stopTracking() {
    const isStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING_TASK);
    if (isStarted) {
      await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
    }
    await AsyncStorage.removeItem('@active_ruta_id');
    await AsyncStorage.removeItem(LAST_LOCATION_KEY);
  },
};
