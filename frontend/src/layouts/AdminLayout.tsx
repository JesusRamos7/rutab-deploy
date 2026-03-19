import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { menuConfig } from "../config/menuConfig";
import { SidebarItem } from "../components/SidebarItem";
import { LogOut } from "lucide-react";
import logo from "../assets/logo_admin_layout.png";

export const AdminLayout = () => {
  const { usuario, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* No corrregir "[260px]" es una falsa alerta */}
      <aside className="w-[260px] bg-neutral-900 text-neutral-50 flex flex-col shadow-lg shrink-0"> 
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

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuConfig.map((item, index) => (
            <SidebarItem key={index} item={item} userRol={usuario?.rol} />
          ))}
        </nav>

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

      <main className="flex-1 bg-white text-neutral-950 m-4 p-8 rounded-2xl shadow-sm overflow-y-auto relative">
        <Outlet />
      </main>
    </div>
  );
};
