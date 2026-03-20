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
    // 1. Validaciones básicas de UI
    if (!usuario.trim() || !password.trim()) {
      Alert.alert("Atención", "Por favor ingresa tu usuario y contraseña.");
      return;
    }

    setLoading(true);

    try {
      // 2. Llamada al servicio (ya tipado y centralizado)
      const data = await loginService(usuario.trim(), password);

      // 3. Validación de rol (Regla de negocio: Solo Choferes)
      if (data.tipo !== "CHOFER") {
        Alert.alert(
          "Acceso Denegado",
          "Esta aplicación es exclusiva para choferes.",
        );
        return;
      }

      // 4. Persistencia en Contexto y Storage
      await login(data.access_token, data.usuario);
    } catch (error: any) {
      // 5. Manejo de errores exhaustivo
      const mensajeError =
        error.response?.data?.message ||
        error.message ||
        "No se pudo conectar con el servidor.";

      Alert.alert("Error de Inicio de Sesión", mensajeError);
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
