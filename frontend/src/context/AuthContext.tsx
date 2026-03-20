// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { api } from "../config/api"; // Tu instancia de Axios configurada

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  foto_perfil_url?: string | null;
}

interface AuthContextType {
  token: string | null;
  usuario: Usuario | null;
  cargandoAuth: boolean;
  login: (token: string, usuario: Usuario, tipo: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  // 1. VALIDACIÓN DE IDENTIDAD (El corazón de la seguridad)
  useEffect(() => {
    const verificarSesion = async () => {
      const tokenGuardado = localStorage.getItem("token");

      // Si ni siquiera hay token, no perdemos tiempo llamando al servidor
      if (!tokenGuardado) {
        setCargandoAuth(false);
        return;
      }

      try {
        /* Llamamos al backend para validar el token. 
           Tu interceptor en api.ts inyectará automáticamente el "Bearer token" 
        */
        const { data } = await api.get("/auth/profile");

        // Si el servidor responde con éxito, el token es real y vigente
        setToken(tokenGuardado);
        setUsuario(data);

        localStorage.setItem('usuario', JSON.stringify(data));
      } catch (error) {
        /* Si hay error (401, 403, etc.), el interceptor de api.ts 
           ya limpia el localStorage, así que aquí solo reseteamos el estado.
        */
        console.error("Sesión inválida o manipulada detectada.");
        setToken(null);
        setUsuario(null);
      } finally {
        // Pase lo que pase, dejamos de cargar para mostrar la ruta correspondiente
        setCargandoAuth(false);
      }
    };

    verificarSesion();
  }, []);

  // 2. LOGIN CON FILTRO DE TIPO
  const login = (newToken: string, newUsuario: Usuario, tipo: string) => {
    if (tipo !== "ADMIN") {
      throw new Error(
        "Acceso denegado. Esta plataforma es exclusiva para administradores.",
      );
    }

    // Actualizamos estado y persistencia
    setToken(newToken);
    setUsuario(newUsuario);
    localStorage.setItem("token", newToken);
    localStorage.setItem("usuario", JSON.stringify(newUsuario));
  };

  // 3. LOGOUT LIMPIO
  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    // Redirección forzada para limpiar cualquier rastro de estado en memoria
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{ token, usuario, cargandoAuth, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
