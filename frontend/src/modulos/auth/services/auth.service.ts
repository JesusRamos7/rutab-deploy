// frontend/src/modulos/auth/services/auth.service.ts

import { isAxiosError } from "axios";
import { api } from "../../../config/api"; // Asegúrate de que la ruta apunte correctamente a tu api.ts
import { LoginCredentials, LoginResponse } from "../types/auth.types";

export const loginService = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  try {
    // Usamos nuestra instancia 'api'. El baseURL y los headers ya están configurados.
    // Asumo que tu endpoint es /auth/login.
    const { data } = await api.post<LoginResponse>("/auth/login", credentials);

    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      // NestJS arroja 401 Unauthorized si el password o usuario fallan
      if (error.response.status === 401) {
        throw new Error("Credenciales incorrectas");
      }

      // Capturamos cualquier otro error (ej. 400 Bad Request si falta un campo)
      const message = error.response.data.message;
      const finalMessage = Array.isArray(message)
        ? message.join(", ")
        : message;
      throw new Error(finalMessage || "Error al iniciar sesión");
    }

    throw new Error("Error de conexión con el servidor");
  }
};
