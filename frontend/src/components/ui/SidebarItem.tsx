// src/components/ui/SidebarItem.tsx
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { MenuItem } from "../../config/menuConfig";

interface SidebarItemProps {
  /** Objeto de configuración del ítem de menú */
  item: MenuItem;
  /** Rol del usuario actual para validación de acceso */
  userRol: string | undefined;
}

/**
 * Valida si el rol del usuario tiene permisos sobre un ítem específico.
 */
const hasPermission = (rolesItem: string[], userRol: string | undefined) => {
  if (!userRol) return false;
  return rolesItem.includes(userRol);
};

/**
 * Componente individual de la barra lateral.
 * Gestiona rutas simples, submenús desplegables y seguridad por roles.
 */
export const SidebarItem = ({ item, userRol }: SidebarItemProps) => {
  const location = useLocation();

  // Determina si alguna ruta hija coincide con la URL actual para mantener el menú expandido
  const isChildActive = item.subItems?.some((sub) =>
    location.pathname.includes(sub.path),
  );
  const [isOpen, setIsOpen] = useState(isChildActive || false);

  // Validación de seguridad a nivel de ítem principal
  if (!hasPermission(item.roles, userRol)) return null;

  // Filtrado de sub-ítems según permisos; si tiene hijos pero ninguno es accesible, se oculta el padre
  const subItemsPermitidos =
    item.subItems?.filter((sub) => hasPermission(sub.roles, userRol)) || [];
  if (item.subItems && subItemsPermitidos.length === 0) return null;

  const Icon = item.icon;

  // Configuración de estilos dinámicos con Tailwind CSS
  const baseClasses =
    "flex items-center gap-3 p-4 rounded-xl transition-all font-medium text-sm w-full";
  const activeClasses = "bg-blue-600 text-white shadow-md";
  const inactiveClasses =
    "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50";

  // --- CASO 1: Ítem de nivel único (Enlace directo) ---
  if (!item.subItems) {
    return (
      <NavLink
        to={item.path!}
        // 'end' evita que el Home se marque activo cuando estamos en otras rutas de /panel
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

  // --- CASO 2: Ítem con submenú (Desplegable) ---
  return (
    <div className="space-y-1">
      {/* Botón disparador del submenú */}
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

      {/* Contenedor de sub-ítems con transición de altura y opacidad */}
      <div
        className={`space-y-1 pl-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
      >
        {subItemsPermitidos.map((subItem) => {
          const SubIcon = subItem.icon;

          return (
            <NavLink
              key={subItem.path}
              to={subItem.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-colors font-medium text-sm w-full ${
                  isActive
                    ? "text-blue-500 bg-blue-500/10"
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
