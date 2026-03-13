// src/layouts/AdminLayout.tsx
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Para saber en qué ruta estamos y pintar el botón activo

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Función para darle estilo al enlace activo
  const getLinkStyle = (path: string) => {
    const isActive = location.pathname.includes(path);
    return {
      display: 'block',
      padding: '1rem',
      color: '#ffffff',
      textDecoration: 'none',
      backgroundColor: isActive ? '#000000' : 'transparent',
      borderLeft: isActive ? '4px solid #ffffff' : '4px solid transparent',
      transition: 'background-color 0.2s'
    };
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
      
      {/* Barra Lateral (Celeste Negro) */}
      <aside style={{ width: '260px', backgroundColor: '#123a5d', color: '#ffffff', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
        
        {/* Perfil del Usuario */}
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Panel Administrativo</h2>
          <p style={{ margin: '1rem 0 0', fontWeight: 'bold' }}>{admin?.nombre}</p>
          <span style={{ fontSize: '0.75rem', backgroundColor: '#000000', padding: '0.3rem 0.6rem', borderRadius: '12px', marginTop: '0.5rem', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {admin?.rol}
          </span>
        </div>

        {/* Menú de Módulos condicionado por Rol */}
        <nav style={{ flex: 1, padding: '1rem 0', display: 'flex', flexDirection: 'column' }}>
          
          <Link to="/panel/inicio" style={getLinkStyle('/panel/inicio')}>Inicio</Link>

          {(admin?.rol === 'superAdmin' || admin?.rol === 'logístico') && (
            <Link to="/panel/logistica" style={getLinkStyle('/panel/logistica')}>Módulo Logística</Link>
          )}

          {(admin?.rol === 'superAdmin' || admin?.rol === 'auditor') && (
            <Link to="/panel/auditoria" style={getLinkStyle('/panel/auditoria')}>Módulo Auditoría</Link>
          )}

        </nav>

        {/* Botón de Cerrar Sesión */}
        <div style={{ padding: '1.5rem' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área de Contenido Principal (Blanco) */}
      <main style={{ flex: 1, backgroundColor: '#ffffff', color: '#000000', margin: '1rem', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflowY: 'auto' }}>
        {/* El componente <Outlet /> inyectará aquí el contenido del módulo seleccionado */}
        <Outlet /> 
      </main>
    </div>
  );
};