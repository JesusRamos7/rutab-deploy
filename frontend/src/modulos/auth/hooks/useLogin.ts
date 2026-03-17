// frontend/src/modulos/auth/hooks/useLogin.ts

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner'; // Importamos toast para mantener la consistencia
import { useAuth } from '../../../context/AuthContext';
import { loginService } from '../services/auth.service';

export const useLogin = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 1. Agregamos estado de carga
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Bloqueamos el formulario

    try {
      const data = await loginService({ 
        correo, 
        password, 
        tipoAcceso: 'ADMIN' 
      });
      
      // Asegúrate de que este context haga: localStorage.setItem('token', data.access_token)
      login(data.access_token, data.usuario, data.tipo);
      
      toast.success(`¡Bienvenido, ${data.usuario.nombre || 'Administrador'}!`);
      navigate('/panel'); 
    } catch (err: any) {
      const mensajeError = err.message || 'Error al conectar con el servidor';
      
      setError(mensajeError); // Mantiene tu diseño original por si lo usas en el HTML
      toast.error(mensajeError); // Muestra el popup moderno
    } finally {
      setIsLoading(false); // Liberamos el formulario
    }
  };

  return {
    correo,
    setCorreo,
    password,
    setPassword,
    error,
    isLoading, // Exportamos isLoading para deshabilitar el botón en la vista
    handleSubmit
  };
};