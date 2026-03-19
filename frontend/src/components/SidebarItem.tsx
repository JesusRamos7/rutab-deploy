import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { MenuItem } from "../config/menuConfig";

interface SidebarItemProps {
  item: MenuItem;
  userRol: string | undefined;
}

const hasPermission = (rolesItem: string[], userRol: string | undefined) => {
  if (!userRol) return false;
  return rolesItem.includes(userRol);
};

export const SidebarItem = ({ item, userRol }: SidebarItemProps) => {
  const location = useLocation();

  // 1. Manejo de estado abierto/cerrado basado en la ruta hija
  const isChildActive = item.subItems?.some((sub) =>
    location.pathname.includes(sub.path),
  );
  const [isOpen, setIsOpen] = useState(isChildActive || false);

  // 2. Filtrado de permisos
  if (!hasPermission(item.roles, userRol)) return null;

  const subItemsPermitidos =
    item.subItems?.filter((sub) => hasPermission(sub.roles, userRol)) || [];
  if (item.subItems && subItemsPermitidos.length === 0) return null;

  const Icon = item.icon;

  const baseClasses =
    "flex items-center gap-3 p-4 rounded-xl transition-all font-medium text-sm w-full";
  const activeClasses = "bg-blue-600 text-white shadow-md";
  const inactiveClasses =
    "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50";

  // --- CASO 1: Ítem sin hijos ---
  if (!item.subItems) {
    // Usamos el operador "!" ("non-null assertion") porque sabemos que si no tiene subItems, debe tener path
    return (
      <NavLink
        to={item.path!}
        end={item.path === "/panel/inicio"}
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
        }
      >
        <Icon className="w-5 h-5 shrink-0" />
        {item.title}
      </NavLink>
    );
  }

  // --- CASO 2: Ítem con submenú ---
  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${baseClasses} ${isChildActive && !isOpen ? "text-neutral-100 bg-neutral-800/50" : inactiveClasses}`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        {item.title}
        <ChevronDown
          className={`w-4 h-4 ml-auto transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Ajusté el padding-left (pl-6) para que los iconos del submenú se vean alineados */}
      <div
        className={`space-y-1 pl-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
      >
        {subItemsPermitidos.map((subItem) => {
          const SubIcon = subItem.icon; // Extraemos el icono del subItem

          return (
            <NavLink
              key={subItem.path}
              to={subItem.path} // Ahora TypeScript sabe que esto es 100% un string
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-colors font-medium text-sm w-full ${
                  isActive
                    ? "text-blue-500 bg-blue-500/10" // Fondo sutil para el sub-ítem activo
                    : "text-neutral-400 hover:text-neutral-50 hover:bg-neutral-800/50"
                }`
              }
            >
              <SubIcon className="w-4 h-4 shrink-0" />
              {subItem.title}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
