// src/config/api.ts
import axios from "axios";

/**
 * Configuración de la URL base del backend.
 * Utiliza variables de entorno de Vite para facilitar la escalabilidad entre entornos (dev/prod).
 */
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Instancia global de Axios para consumo de la API.
 * Centraliza la configuración de cabeceras y tiempo de espera.
 */
export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor de Peticiones (Request Interceptor).
 * Se ejecuta antes de enviar cada solicitud al servidor.
 * Inyecta automáticamente el token JWT almacenado en el cliente para rutas protegidas.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Interceptor de Respuestas (Response Interceptor).
 * Procesa las respuestas del servidor y captura errores globales de forma centralizada.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo de errores de autenticación (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      /**
       * Prevención de bucles de redirección:
       * Si el error proviene del login, se permite que el componente maneje el error
       * (ej. mostrar 'Contraseña incorrecta') sin cerrar la sesión forzosamente.
       */
      const isLoginRequest = error.config.url.includes("/auth/login");

      if (!isLoginRequest) {
        // Limpieza de datos de sesión por token expirado o inválido
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        // Redirección forzada al punto de entrada de la aplicación
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);
