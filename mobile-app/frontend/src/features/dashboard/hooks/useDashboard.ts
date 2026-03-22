// src/features/dashboard/hooks/useDashboard.ts

import { useAuth } from "../../../core/context/AuthContext";
import { Alert } from "react-native";

export const useDashboard = () => {
  const { usuario, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, salir",
        style: "destructive",
        onPress: async () => await logout(),
      },
    ]);
  };

  return {
    usuario,
    handleLogout,
  };
};
