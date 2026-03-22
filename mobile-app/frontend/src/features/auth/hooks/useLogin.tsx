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

  // Validación de formato de correo (Regex robusto)
  const validarCorreo = (email: string) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const handleLogin = async () => {
    // 1. Saneamiento básico (Quitar espacios en blanco accidentales)
    const correoLimpio = usuario.trim().toLowerCase();
    const passLimpio = password.trim();

    // 2. Validaciones preventivas
    if (!correoLimpio || !passLimpio) {
      Alert.alert("Campos requeridos", "Por favor, completa todos los campos.");
      return;
    }

    if (!validarCorreo(correoLimpio)) {
      Alert.alert(
        "Formato inválido",
        "Por favor, ingresa un correo electrónico válido.",
      );
      return;
    }

    // 3. Control de longitud (Seguridad básica contra ataques de desbordamiento o fuerza bruta local)
    if (passLimpio.length < 6) {
      Alert.alert("Seguridad", "La contraseña es demasiado corta.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginService(correoLimpio, passLimpio);

      if (data.tipo !== "CHOFER") {
        // Mensaje genérico para no dar pistas sobre la existencia de cuentas
        throw new Error("Credenciales no autorizadas para esta aplicación.");
      }

      await login(data.access_token, data.usuario);
    } catch (error: any) {
      // 4. Manejo de errores opaco (Best Practice de Seguridad)
      // No le decimos al usuario exactamente qué falló (si el correo no existe o la pass está mal)
      // para evitar enumeración de usuarios.
      const status = error.response?.status;

      let mensajePublico = "Credenciales incorrectas";

      if (status === 500) {
        mensajePublico = "Error temporal en el servidor. Intenta más tarde.";
      } else if (error.message.includes("network")) {
        mensajePublico = "Sin conexión a internet.";
      }

      Alert.alert("Acceso Denegado", mensajePublico);
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
