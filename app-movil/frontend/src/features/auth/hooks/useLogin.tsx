// src/features/auth/hooks/useLogin.tsx

import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../../../core/context/AuthContext";
import { loginService } from "../services/auth.service";

export const useLogin = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!usuario || !password) {
      Alert.alert("Atención", "Por favor ingresa tu usuario y contraseña.");
      return;
    }

    setLoading(true);

    try {
      // Enviamos directamente las credenciales al servicio
      const data = await loginService(usuario, password);

      if (data.tipo !== "CHOFER") {
        throw new Error("Esta aplicación es exclusiva para choferes.");
      }

      await login(data.access_token, data.usuario);
    } catch (error: any) {
      const mensajeError =
        error.response?.data?.message ||
        error.message ||
        "Error al iniciar sesión";
      Alert.alert("Error de Acceso", mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return {
    usuario,
    setUsuario,
    password,
    setPassword,
    loading,
    handleLogin,
  };
};
