// frontend/src/config/api.ts
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Interceptor de PETICIONES (el que ya teníamos, inyecta el token)
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

// 2. NUEVO: Interceptor de RESPUESTAS (atrapa los errores globales)
api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, la dejamos pasar
  (error) => {
    // Si NestJS nos devuelve un 401 Unauthorized...
    if (error.response && error.response.status === 401) {
      // 1. Evitamos el bucle infinito: Si el 401 viene del endpoint de login, no hacemos la expulsión forzada,
      // porque significa que simplemente se equivocó de contraseña.
      const isLoginRequest = error.config.url.includes("/auth/login");

      if (!isLoginRequest) {
        // 2. Limpiamos los rastros de la sesión expirada
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        // 3. Redirigimos al usuario a la pantalla de inicio de sesión
        window.location.href = "/"; // Asegúrate de que esta ruta coincida con tu vista de login
      }
    }

    return Promise.reject(error);
  },
);
