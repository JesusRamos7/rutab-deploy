// /mobile-app/frontend/src/core/services/locationService.ts

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/apiClient';

const LOCATION_TRACKING_TASK = 'BACKGROUND_LOCATION_TRACKING';
const OFFLINE_STORAGE_KEY = '@offline_locations';
const LAST_LOCATION_KEY = '@last_sent_location';
const ACTIVE_RUTA_KEY = '@active_ruta_id';

/**
 * Calcula la distancia en metros entre dos coordenadas (Fórmula Haversine)
 */
export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Radio de la tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Tarea en segundo plano.
 * NOTA: Debe estar fuera de cualquier componente.
 */
TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error(`[GPS Background] Error en tarea: ${error.message}`);
    return;
  }

  if (data) {
    const { locations } = data;
    const [location] = locations;

    if (!location) return;

    try {
      const { latitude, longitude, speed, heading, accuracy } = location.coords;

      // 1. Verificar si hay una ruta activa
      const rutaId = await AsyncStorage.getItem(ACTIVE_RUTA_KEY);
      if (!rutaId) {
        // Si no hay ruta, apagamos el tracking por seguridad
        await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
        return;
      }

      // 2. Filtro de precisión: Si el GPS es muy impreciso (> 50m), ignoramos el punto
      if (accuracy && accuracy > 50) return;

      // 3. Filtro de Movimiento (Evitar saltos cuando está detenido)
      const lastLocStr = await AsyncStorage.getItem(LAST_LOCATION_KEY);
      if (lastLocStr) {
        try {
          const lastLoc = JSON.parse(lastLocStr);
          const distance = getDistance(latitude, longitude, lastLoc.lat, lastLoc.lng);

          // Si se movió menos de 5 metros y la velocidad es nula, ignorar
          if (distance < 5 && (speed || 0) < 0.5) return;
        } catch (e) {
          await AsyncStorage.removeItem(LAST_LOCATION_KEY);
        }
      }

      // --- OBTENCIÓN DEL NIVEL DE BATERÍA ---
      const batteryLevel = await Battery.getBatteryLevelAsync();
      const batteryPercentage = Math.round(batteryLevel * 100);

      const payload = {
        rutaId,
        latitude,
        longitude,
        velocidad: speed ? Math.round(speed * 3.6) : 0, // Convertir m/s a km/h
        bateria: batteryPercentage,
      };

      // 4. Intentar envío al servidor
      try {
        await apiClient.post('/mobile-app/routes/tracking', payload, { timeout: 5000 });

        // Actualizar última ubicación enviada
        await AsyncStorage.setItem(
          LAST_LOCATION_KEY,
          JSON.stringify({ lat: latitude, lng: longitude })
        );

        // Si el envío fue exitoso, intentar vaciar el buffer offline
        await flushOfflineLocations();
      } catch (err) {
        // Si falla (ej. sin internet), guardar offline
        await saveLocationOffline(payload);
      }
    } catch (criticalError) {
      console.error('[GPS Background] Error crítico procesando ubicación:', criticalError);
    }
  }
});

/**
 * Guarda ubicaciones localmente para sincronización posterior
 */
const saveLocationOffline = async (payload: any) => {
  try {
    const existing = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY);
    const locations = existing ? JSON.parse(existing) : [];

    // Limitar el buffer a los últimos 100 puntos para no saturar memoria
    if (locations.length > 100) locations.shift();

    locations.push({ ...payload, timestamp: new Date().toISOString() });
    await AsyncStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(locations));
  } catch (e) {
    console.error('[Offline Storage] Error guardando punto:', e);
  }
};

/**
 * Sincroniza los puntos guardados cuando vuelve el internet
 */
let isFlushing = false;
const flushOfflineLocations = async () => {
  if (isFlushing) return;

  try {
    isFlushing = true;
    const existing = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!existing) return;

    const locations = JSON.parse(existing);
    if (locations.length === 0) return;

    // Vaciamos el storage ANTES de enviar para evitar duplicidad si entra otro proceso
    await AsyncStorage.removeItem(OFFLINE_STORAGE_KEY);

    for (const loc of locations) {
      try {
        await apiClient.post('/mobile-app/routes/tracking', loc, { timeout: 5000 });
      } catch (e) {
        // Si vuelve a fallar, lo regresamos al storage al final
        await saveLocationOffline(loc);
      }
    }
  } catch (e) {
    console.warn('[Offline Sync] Fallo en sincronización:', e);
  } finally {
    isFlushing = false;
  }
};

/**
 * Controlador de servicio para la UI
 */
export const LocationService = {
  async startTracking(rutaId: string) {
    try {
      await AsyncStorage.setItem(ACTIVE_RUTA_KEY, rutaId);
      await AsyncStorage.removeItem(LAST_LOCATION_KEY);

      // Verificar permisos de primer plano
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') throw new Error('No se concedió permiso de GPS (Primer plano)');

      // Verificar permisos de segundo plano (Crucial para Android 10+ e iOS)
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== 'granted')
        throw new Error('No se concedió permiso de GPS (Segundo plano/Siempre)');

      const isStarted = await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK);

      // Iniciar el servicio
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
        accuracy: Location.Accuracy.High, // Alta precisión requerida para logística
        timeInterval: 30000, // Intentar cada 30 segundos
        distanceInterval: 15, // Mínimo 15 metros para reportar
        showsBackgroundLocationIndicator: true, // Barra azul en iOS
        foregroundService: {
          notificationTitle: 'Ruta en Proceso',
          notificationBody: 'Compartiendo ubicación para monitoreo de entrega.',
          notificationColor: '#123a5d',
        },
      });

      console.log('[LocationService] Tracking iniciado correctamente');
    } catch (error: any) {
      console.error('[LocationService] Error al iniciar:', error.message);
      throw error;
    }
  },

  async stopTracking() {
    try {
      const isStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING_TASK);
      if (isStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
      }
      await AsyncStorage.removeItem(ACTIVE_RUTA_KEY);
      await AsyncStorage.removeItem(LAST_LOCATION_KEY);
      console.log('[LocationService] Tracking detenido');
    } catch (error) {
      console.error('[LocationService] Error al detener:', error);
    }
  },
};
