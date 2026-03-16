// frontend/src/modulos/auth/hooks/useLogin.ts

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { loginService } from '../services/auth.service';

export const useLogin = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Mandamos explícitamente el tipo de acceso que requiere este frontend
      const data = await loginService({ 
        correo, 
        password, 
        tipoAcceso: 'ADMIN' 
      });
      
      // 2. Guardamos en el contexto global con la nueva estructura
      // Pasamos token, el objeto usuario y el tipo que nos devuelve el backend
      login(data.access_token, data.usuario, data.tipo);
      
      navigate('/panel'); 
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
    }
  };

  return {
    correo,
    setCorreo,
    password,
    setPassword,
    error,
    handleSubmit
  };
};