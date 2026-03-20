import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  cargandoAuth: boolean; // <-- Nuevo: Para saber si estamos leyendo el storage
  login: (token: string, usuario: Usuario, tipo: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargandoAuth, setCargandoAuth] = useState(true); // Iniciamos en true

  // 1. Efecto de Hidratación Inicial
  useEffect(() => {
    const recuperarDatos = () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUsuario = localStorage.getItem('usuario');

        if (savedToken && savedUsuario) {
          setToken(savedToken);
          setUsuario(JSON.parse(savedUsuario));
        }
      } catch (error) {
        console.error("Error recuperando sesión:", error);
        // Si el JSON está mal formado, limpiamos por seguridad
        localStorage.clear();
      } finally {
        // IMPORTANTE: Una vez que revisamos el storage, terminamos la carga
        setCargandoAuth(false);
      }
    };

    recuperarDatos();
  }, []);

  const login = (newToken: string, newUsuario: Usuario, tipo: string) => {
    // FILTRO DE SEGURIDAD
    if (tipo !== 'ADMIN') {
      throw new Error('Acceso denegado. Esta plataforma es exclusiva para administradores.');
    }

    setToken(newToken);
    setUsuario(newUsuario);
    localStorage.setItem('token', newToken);
    localStorage.setItem('usuario', JSON.stringify(newUsuario));
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    // window.location.href es radical pero efectivo para limpiar fugas de memoria
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ token, usuario, cargandoAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};