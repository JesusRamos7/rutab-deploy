import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Cambiamos el nombre de Admin a Usuario para que coincida con el backend.
// Opcional: Agregué foto_perfil_url ya que el backend del admin lo devuelve.
interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  foto_perfil_url?: string | null;
}

// 2. Actualizamos el tipo del contexto
interface AuthContextType {
  token: string | null;
  usuario: Usuario | null;
  // Agregamos el parámetro 'tipo' a la firma de la función
  login: (token: string, usuario: Usuario, tipo: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  // Cambiamos 'admin' a 'usuario' para el estado y el localStorage
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const savedUsuario = localStorage.getItem('usuario');
    return savedUsuario ? JSON.parse(savedUsuario) : null;
  });

  // 3. Modificamos el login para incluir el filtro de seguridad
  const login = (newToken: string, newUsuario: Usuario, tipo: string) => {
    
    // FILTRO DE SEGURIDAD: Si no es admin, bloqueamos el acceso en el frontend.
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
    // Redirección forzada: Limpia la memoria de React y envía al usuario al login
    window.location.href = '/login';
  };

  return (
    // Pasamos 'usuario' en lugar de 'admin'
    <AuthContext.Provider value={{ token, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};