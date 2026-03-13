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
      // Llamamos a nuestro servicio limpio
      const data = await loginService({ correo, password });
      
      // Guardamos en el contexto global
      login(data.access_token, data.admin);
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