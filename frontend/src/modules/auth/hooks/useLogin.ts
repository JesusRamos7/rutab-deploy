// src/modules/auth/hooks/useLogin.ts

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";
import { loginService } from "../services/auth.service";

/**
 * Hook personalizado para gestionar la lógica del formulario de inicio de sesión.
 * Centraliza el estado de las credenciales, validaciones y la comunicación con el servicio de autenticación.
 */
export const useLogin = () => {
  // Estados locales para el control de inputs y feedback de usuario
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  /**
   * Procesa el envío del formulario.
   * Coordina la llamada al servicio, la actualización del contexto global y las redirecciones.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Bloqueo de UI para evitar múltiples peticiones concurrentes

    try {
      // Petición al servicio de autenticación con filtro explícito para perfil administrativo
      const data = await loginService({
        correo,
        password,
        tipoAcceso: "ADMIN",
      });

      /**
       * Actualización del estado global de la aplicación.
       * El método 'login' del contexto se encarga de la persistencia en LocalStorage.
       */
      login(data.access_token, data.usuario, data.tipo);

      // Feedback visual y navegación hacia la ruta protegida
      toast.success(`¡Bienvenid@, ${data.usuario.nombre || "Administrador"}!`);
      navigate("/panel");
    } catch (err: any) {
      // Gestión de errores: se prioriza el mensaje del servidor o un fallback genérico
      const mensajeError = err.message || "Error al conectar con el servidor";
      setError(mensajeError);
    } finally {
      // Restauración del estado de carga independientemente del resultado de la operación
      setIsLoading(false);
    }
  };

  return {
    correo,
    setCorreo,
    password,
    setPassword,
    error,
    isLoading,
    handleSubmit,
  };
};
