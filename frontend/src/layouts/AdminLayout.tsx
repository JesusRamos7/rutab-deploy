// src/layouts/AdminLayout.tsx
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from '../assets/logo_admin_layout.png';

export const AdminLayout = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Función para obtener las clases de Tailwind del enlace activo
  const getLinkClasses = (path: string) => {
    const isActive = location.pathname.includes(path);
    const baseClasses =
      "flex items-center gap-3 p-4 rounded-xl transition-colors font-medium text-sm";

    if (isActive) {
      return `${baseClasses} bg-blue-600 text-white`;
    }
    return `${baseClasses} text-neutral-50 hover:bg-neutral-800`;
  };

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Barra Lateral (Tema Oscuro - w-[260px]) */}
      <aside className="w-260px bg-neutral-900 text-neutral-50 flex flex-col shadow-lg">
        {/* Encabezado (Logo + Título - p-8, border-b) */}
        <div className="p-8 border-b border-neutral-800">
          <div className="flex items-center gap-4">
            {/* Contenedor del Logo (cuadrado blanco rounded-xl) */}
            <div className="p-2 bg-white rounded-xl shadow-inner w-16 h-16 flex items-center justify-center">
              <img
                src={logo}
                alt="Logo RuTAB"
                //className="max-w-full max-h-full"
              />
            </div>
            {/* Títulos (RuTAB, Admin Panel) */}
            <div>
              <h1 className="text-xl font-semibold">RuTAB</h1>
              <p className="text-sm text-neutral-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Menú de Módulos condicionado por Rol */}
        <nav className="flex-1 p-4 space-y-1">
          {/* Aquí integraríamos los iconos de Lucide en el siguiente paso */}
          <Link to="/panel/inicio" className={getLinkClasses("/panel/inicio")}>
            Inicio
          </Link>

          {(usuario?.rol === "superAdmin" || usuario?.rol === "logístico") && (
            <Link
              to="/panel/logistica"
              className={getLinkClasses("/panel/logistica")}
            >
              Módulo Logística
            </Link>
          )}

          {(usuario?.rol === "superAdmin" || usuario?.rol === "auditor") && (
            <Link
              to="/panel/auditoria"
              className={getLinkClasses("/panel/auditoria")}
            >
              Módulo Auditoría
            </Link>
          )}
        </nav>

        {/* Sección de Cerrar Sesión (al final del sidebar, p-6 mt-auto) */}
        <div className="p-6 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full p-4 bg-neutral-950 text-neutral-50 rounded-lg hover:bg-neutral-800 transition-colors font-bold text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área de Contenido Principal (Blanco rounded-2xl shadow-sm m-4 p-8) */}
      <main className="flex-1 bg-white text-neutral-950 m-4 p-8 rounded-2xl shadow-sm overflow-y-auto">
        {/* El componente <Outlet /> inyectará aquí el contenido del módulo seleccionado */}
        <Outlet />
      </main>
    </div>
  );
};
