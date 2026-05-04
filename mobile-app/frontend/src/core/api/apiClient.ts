// /mobile-app/frontend/src/core/api/apiClient.ts

import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = __DEV__
  ? process.env.EXPO_PUBLIC_API_URL_DEV
  : process.env.EXPO_PUBLIC_API_URL_PROD;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 segundos: Vital para redes móviles inestables
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token en cada petición
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@token_chofer');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error al recuperar token de AsyncStorage', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globales y normalizar respuestas
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // 1. Manejo de Sesión Expirada o Inválida (401)
    if (error.response?.status === 401) {
      console.warn('Sesión no autorizada/expirada. Limpiando credenciales...');
      await AsyncStorage.multiRemove(['@token_chofer', '@usuario_chofer']);

      // Nota: Aquí la UI debería reaccionar mediante el AuthContext
      // al detectar que ya no hay token en el storage.
    }

    // 2. Normalización de errores para el resto de la App
    // Esto evita que tengas que hacer .join('\n') en cada pantalla.
    if (error.response) {
      const data: any = error.response.data;

      // Si NestJS envía un array de mensajes (validaciones de DTO)
      if (data?.message && Array.isArray(data.message)) {
        data.message = data.message.join('\n');
      }

      // Si no hay mensaje pero hay un error de sistema (ej. 500)
      if (!data?.message) {
        if (error.response.status >= 500) {
          data.message = 'El servidor de logística no responde. Intenta más tarde.';
        } else {
          data.message = 'Ocurrió un error inesperado en la comunicación.';
        }
      }
    } else if (error.code === 'ECONNABORTED') {
      // Error de Timeout
      error.message = 'La conexión tardó demasiado. Verifica tu señal de internet.';
    } else if (!error.response) {
      // Error de Red (sin internet)
      error.message = 'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
    }

    // Logs detallados solo en desarrollo
    if (__DEV__) {
      console.log('--- API ERROR LOG ---');
      console.log('URL:', error.config?.url);
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data || error.message);
      console.log('----------------------');
    }

    return Promise.reject(error);
  }
);

/**
 * Utility para extraer el mensaje ya normalizado por el interceptor.
 * Úsalo en tus catch de las pantallas.
 */
export const getErrorMessage = (error: any): string => {
  return error.response?.data?.message || error.message || 'Error desconocido';
};
