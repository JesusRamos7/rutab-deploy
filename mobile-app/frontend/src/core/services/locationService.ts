// /mobile-app/frontend/src/core/services/locationService.ts

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/apiClient';

// Nombre único para la tarea en segundo plano
const LOCATION_TRACKING_TASK = 'BACKGROUND_LOCATION_TRACKING';
const OFFLINE_STORAGE_KEY = '@offline_locations';

/**
 * Definición de la tarea en segundo plano.
 * DEBE definirse en el ámbito global (fuera de cualquier componente/clase).
 */
TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('Error en TaskManager:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const [location] = locations;

    if (location) {
      const { latitude, longitude, speed } = location.coords;
      const rutaId = await AsyncStorage.getItem('@active_ruta_id');

      if (!rutaId) return; // No hay ruta activa, no trackeamos.

      const payload = {
        rutaId,
        latitude,
        longitude,
        velocidad: speed ? Math.round(speed * 3.6) : 0, // Convertir m/s a km/h
      };

      try {
        // Intentamos enviar al backend
        await apiClient.post('/mobile-app/routes/tracking', payload);

        // Si hay puntos guardados offline, intentar vaciarlos ahora que hay red
        await flushOfflineLocations();
      } catch (err) {
        // Si falla (offline), guardamos en AsyncStorage
        await saveLocationOffline(payload);
      }
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
  /**
   * Solicita permisos e inicia el rastreo.
   */
  async startTracking(rutaId: string) {
    try {
      // 1. Guardar ID de ruta para que el TaskManager lo vea
      await AsyncStorage.setItem('@active_ruta_id', rutaId);

      // 2. Permisos de primer plano
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') throw new Error('Permiso de GPS denegado');

      // 3. Permisos de segundo plano (Background)
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== 'granted') throw new Error('Permiso de GPS en segundo plano denegado');

      // 4. Iniciar tarea
      const isStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING_TASK);
      if (isStarted) return;

      await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60000, // 60 segundos
        distanceInterval: 10, // o cada 10 metros
        foregroundService: {
          notificationTitle: 'Ruta en Progreso',
          notificationBody: 'Tu ubicación se está compartiendo con la central.',
          notificationColor: '#123a5d',
        },
      });

      console.log('Tracking iniciado correctamente');
    } catch (error) {
      console.error('Error al iniciar tracking:', error);
      throw error;
    }
  },

  /**
   * Detiene el rastreo y limpia el estado.
   */
  async stopTracking() {
    const isStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING_TASK);
    if (isStarted) {
      await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
    }
    await AsyncStorage.removeItem('@active_ruta_id');
    console.log('Tracking detenido');
  },
};
