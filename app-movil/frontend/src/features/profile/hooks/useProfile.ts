// src/features/profile/hooks/useProfile.ts

import { useAuth } from "../../../core/context/AuthContext";

export const useProfile = () => {
  const { usuario, logout } = useAuth();

  // Aquí podrías agregar lógica para formatear el teléfono o la licencia
  const infoChofer = {
    nombre: usuario?.nombre || "No disponible",
    correo: usuario?.correo || "No disponible",
    licencia: usuario?.licencia || "Sin licencia registrada",
    telefono: usuario?.telefono || "Sin teléfono",
    foto: usuario?.foto_perfil_url,
  };

  return {
    infoChofer,
    logout,
  };
};
