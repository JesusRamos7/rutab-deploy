// src/components/guards/RoleGuard.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Definición de roles de usuario soportados por el sistema para tipado estricto.
 */
export type UserRole = "superAdmin" | "logístico" | "auditor" | "";

interface RoleGuardProps {
  /** Colección de roles con acceso autorizado a la ruta */
  allowedRoles: UserRole[];
  /** Contenido protegido que se renderizará si se cumplen los criterios de acceso */
  children: React.ReactNode;
}

/**
 * Componente de protección de rutas basado en roles.
 * Valida si el usuario actual posee los privilegios necesarios para visualizar el contenido.
 */
export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { usuario } = useAuth();

  /**
   * Criterios de validación:
   * 1. El rol 'superAdmin' tiene acceso global (bypass).
   * 2. El rol del usuario debe coincidir con alguno de los declarados en allowedRoles.
   */
  const tienePermiso =
    usuario?.rol === "superAdmin" ||
    allowedRoles.includes(usuario?.rol as UserRole);

  if (!tienePermiso) {
    // Redirección con reemplazo de historial para evitar ciclos de navegación
    return <Navigate to="/panel/inicio" replace />;
  }

  // Renderizado de fragmento para evitar nodos adicionales en el DOM
  return <>{children}</>;
};
