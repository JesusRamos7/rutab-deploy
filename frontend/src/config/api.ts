// frontend/src/config/api.ts
import axios from 'axios';

// Creamos la instancia con la configuración base
export const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de peticiones: Se ejecuta ANTES de que cualquier petición salga
api.interceptors.request.use(
  (config) => {
    // Buscamos el token configurado previamente
    const token = localStorage.getItem('token');
    
    // Si existe, lo inyectamos en los headers de autorización
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);