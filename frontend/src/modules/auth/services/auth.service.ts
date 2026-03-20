// src/modules/auth/services/auth.service.ts

import { isAxiosError } from "axios";
import { api } from "../../../config/api";
import { LoginCredentials, LoginResponse } from "../types/auth.types";

/**
 * Servicio encargado de la comunicación con el endpoint de autenticación.
 * @param credentials - Objeto con correo, password y tipo de acceso.
 * @returns Promesa con la respuesta del servidor (token y datos de usuario).
 * @throws Error con mensaje descriptivo para ser capturado por el hook useLogin.
 */
export const loginService = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  try {
    /**
     * Petición POST al endpoint de login.
     * La instancia 'api' ya incluye el baseURL y las cabeceras base.
     */
    const { data } = await api.post<LoginResponse>("/auth/login", credentials);

    return data;
  } catch (error) {
    // Validación de errores específicos de Axios/Red
    if (isAxiosError(error) && error.response) {
      /**
       * Manejo de error 401:
       * Específicamente para fallos en la validación de identidad (Passport/JWT).
       */
      if (error.response.status === 401) {
        throw new Error("Credenciales incorrectas");
      }

      /**
       * Procesamiento de mensajes de error de NestJS:
       * Si el error es una validación de campos (400), NestJS suele enviar un array de strings.
       * Aquí lo normalizamos a una sola cadena legible.
       */
      const message = error.response.data.message;
      const finalMessage = Array.isArray(message)
        ? message.join(", ")
        : message;

      throw new Error(finalMessage || "Error al iniciar sesión");
    }

    // Fallback para errores de red o servidor no disponible
    throw new Error("Error de conexión con el servidor");
  }
};
