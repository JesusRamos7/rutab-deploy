// /mobile-app/frontend/src/core/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Llaves constantes para evitar errores de dedo
const TOKEN_KEY = '@token_chofer';
const USER_KEY = '@usuario_chofer';
const RUTA_KEY = '@active_ruta_id';
const LAST_LOC_KEY = '@last_sent_location';
const OFFLINE_LOCS = '@offline_locations';

export interface UsuarioChofer {
  id: string;
  nombre: string;
  correo: string;
  licencia?: string;
  telefono?: string;
  foto_perfil_url?: string;
  rol: string;
}

interface AuthContextType {
  token: string | null;
  usuario: UsuarioChofer | null;
  isLoading: boolean;
  login: (token: string, usuario: UsuarioChofer) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<UsuarioChofer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al abrir la app, recuperamos la sesión de forma segura
  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const [tokenGuardado, usuarioGuardado] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        if (tokenGuardado && usuarioGuardado) {
          try {
            const parsedUser = JSON.parse(usuarioGuardado);
            setToken(tokenGuardado);
            setUsuario(parsedUser);
          } catch (parseError) {
            // Si el JSON está mal formado, limpiamos todo para evitar crashes
            console.error('Datos de usuario corruptos, limpiando sesión...');
            await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
          }
        }
      } catch (error) {
        console.error('Error crítico al cargar AsyncStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarSesion();
  }, []);

  // Función para guardar sesión (Blindada)
  const login = async (newToken: string, newUsuario: UsuarioChofer) => {
    try {
      setToken(newToken);
      setUsuario(newUsuario);

      await AsyncStorage.multiSet([
        [TOKEN_KEY, newToken],
        [USER_KEY, JSON.stringify(newUsuario)],
      ]);
    } catch (error) {
      console.error('Error al persistir login:', error);
      Alert.alert(
        'Aviso de Memoria',
        'La sesión se inició pero no pudo guardarse permanentemente. Verifica el espacio en tu dispositivo.'
      );
    }
  };

  // Función para borrar sesión (Limpieza Profunda)
  const logout = async () => {
    try {
      // 1. Limpieza de estado en memoria
      setToken(null);
      setUsuario(null);

      // 2. Limpieza de almacenamiento (incluye llaves de GPS para evitar "fantasmas")
      const keysToRemove = [TOKEN_KEY, USER_KEY, RUTA_KEY, LAST_LOC_KEY, OFFLINE_LOCS];

      await AsyncStorage.multiRemove(keysToRemove);
    } catch (error) {
      console.error('Error durante el logout:', error);
      // Fallback: forzamos el borrado de estados incluso si AsyncStorage falla
      setToken(null);
      setUsuario(null);
    }
  };

  return (
    <AuthContext.Provider value={{ token, usuario, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
