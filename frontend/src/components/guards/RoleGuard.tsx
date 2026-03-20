// src/components/guards/RoleGuard.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Definimos los roles como un tipo para evitar errores de escritura
export type UserRole = "superAdmin" | "logístico" | "auditor" | "";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { usuario } = useAuth();

  // Si el usuario es superAdmin siempre pasa,
  // o si su rol está incluido en la lista de permitidos.
  const tienePermiso =
    usuario?.rol === "superAdmin" ||
    allowedRoles.includes(usuario?.rol as UserRole);

  if (!tienePermiso) {
    // Redirigimos al inicio si no tiene permisos
    return <Navigate to="/panel/inicio" replace />;
  }

  return <>{children}</>;
};
