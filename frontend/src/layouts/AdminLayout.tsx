import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { menuConfig } from "../config/menuConfig";
import { LogOut } from "lucide-react";
import logo from "../assets/logo_admin_layout.png";

export const AdminLayout = () => {
  const { usuario, logout } = useAuth();

  // Filtramos el menú basándonos en el rol del usuario autenticado
  const menuPermitido = menuConfig.filter((item) =>
    usuario?.rol ? item.roles.includes(usuario?.rol) : false
  );

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Barra Lateral */}
      <aside className="w-[260px] bg-neutral-900 text-neutral-50 flex flex-col shadow-lg">
        
        {/* Encabezado */}
        <div className="p-8 border-b border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white rounded-xl shadow-inner w-16 h-16 flex items-center justify-center shrink-0">
              <img src={logo} alt="Logo RuTAB" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">RuTAB</h1>
              <p className="text-sm text-neutral-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Menú de Módulos Dinámico */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuPermitido.map((item) => {
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/panel/inicio"} 
                className={({ isActive }) =>
                  `flex items-center gap-3 p-4 rounded-xl transition-all font-medium text-sm ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.title}
              </NavLink>
            );
          })}
        </nav>

        {/* Sección de Cerrar Sesión */}
        <div className="p-6 border-t border-neutral-800">
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full p-4 bg-neutral-950 text-neutral-50 rounded-lg hover:bg-red-600/90 hover:text-white transition-all font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área de Contenido Principal */}
      <main className="flex-1 bg-white text-neutral-950 m-4 p-8 rounded-2xl shadow-sm overflow-y-auto relative">
        <Outlet />
      </main>
    </div>
  );
};