// src/features/auth/services/auth.service.ts

import { apiClient } from "../../../core/api/apiClient";
import { UsuarioChofer } from "../../../core/context/AuthContext";

// Definimos la interfaz de respuesta para mantener el tipado fuerte de TypeScript
interface LoginResponse {
  access_token: string;
  usuario: UsuarioChofer;
  tipo: string;
}

export const loginService = async (correo: string, password: string): Promise<LoginResponse> => {
  // El endpoint ahora es relativo a la baseURL del apiClient
  const { data } = await apiClient.post<LoginResponse>("/auth/login", {
    correo,
    password,
    tipoAcceso: "CHOFER",
  });

  return data;
};