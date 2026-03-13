import { LoginCredentials, LoginResponse } from '../types/auth.types';

// Vite usa import.meta.env para leer variables de entorno. 
// Si no existe (producción), usará localhost como respaldo (desarrollo).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const loginService = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Credenciales incorrectas');
  }

  return response.json();
};