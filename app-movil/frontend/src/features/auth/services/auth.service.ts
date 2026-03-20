// src/features/auth/services/auth.service.ts


import axios from "axios";

// Función para obtener la URL correcta del backend local
const getApiUrl = () => {
  // Cambiar esta IP por la IP local de tu computadora (ej: '192.168.1.88')
  // Para saber tu IP jecuta en powershell el comando: ipconfig
  const IP_RED_LOCAL = "192.168.100.7";

  if (__DEV__) {
    // En desarrollo (Expo Go), siempre usamos tu IP de la red Wi-Fi
    return `http://${IP_RED_LOCAL}:3000/auth`;
  }

  return "https://tu-backend-produccion.com/auth";
};

const API_URL = getApiUrl();

export const loginService = async (correo: string, password: string) => {
  // Aquí usamos la "Intención Explícita" que programamos en NestJS
  const response = await axios.post(`${API_URL}/login`, {
    correo,
    password,
    tipoAcceso: "CHOFER",
  });

  return response.data;
};
