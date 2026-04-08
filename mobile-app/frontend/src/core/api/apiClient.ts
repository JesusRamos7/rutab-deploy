// src/core/api/apiClient.ts

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = __DEV__
  ? process.env.EXPO_PUBLIC_API_URL_DEV
  : process.env.EXPO_PUBLIC_API_URL_PROD;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token en cada petición
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@token_chofer');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globales (ej. sesión expirada)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Aquí podrías disparar un logout global si el token ya no es válido
      await AsyncStorage.multiRemove(['@token_chofer', '@usuario_chofer']);
    }
    return Promise.reject(error);
  }
);
