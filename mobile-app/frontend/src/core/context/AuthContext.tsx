// /mobile-app/frontend/src/core/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Esta interfaz coincide exactamente con lo que devuelve tu NestJS para un chofer
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
  isLoading: boolean; // Fundamental para evitar parpadeos al abrir la app
  login: (token: string, usuario: UsuarioChofer) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<UsuarioChofer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al abrir la app, intentamos recuperar la sesión guardada
  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const tokenGuardado = await AsyncStorage.getItem("@token_chofer");
        const usuarioGuardado = await AsyncStorage.getItem("@usuario_chofer");

        if (tokenGuardado && usuarioGuardado) {
          setToken(tokenGuardado);
          setUsuario(JSON.parse(usuarioGuardado));
        }
      } catch (error) {
        console.error("Error al cargar la sesión:", error);
      } finally {
        setIsLoading(false); // Ya revisamos, podemos renderizar la pantalla correcta
      }
    };

    cargarSesion();
  }, []);

  // Función para guardar sesión
  const login = async (newToken: string, newUsuario: UsuarioChofer) => {
    setToken(newToken);
    setUsuario(newUsuario);
    await AsyncStorage.setItem("@token_chofer", newToken);
    await AsyncStorage.setItem("@usuario_chofer", JSON.stringify(newUsuario));
  };

  // Función para borrar sesión
  const logout = async () => {
    setToken(null);
    setUsuario(null);
    await AsyncStorage.removeItem("@token_chofer");
    await AsyncStorage.removeItem("@usuario_chofer");
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
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
