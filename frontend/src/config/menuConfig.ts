import { LayoutDashboard, Truck, ShieldCheck, LucideIcon } from "lucide-react";

// Tipamos los roles explícitamente basados en tu lógica de negocio
export type RolPermitido = "superAdmin" | "logístico" | "auditor" | string;

export interface MenuItem {
  title: string;
  path: string;
  icon: LucideIcon;
  roles: RolPermitido[]; // Roles que pueden ver este ítem
}

export const menuConfig: MenuItem[] = [
  {
    title: "Inicio",
    path: "/panel/inicio",
    icon: LayoutDashboard,
    // Como "Inicio" estaba visible para todos, incluimos todos los roles base
    roles: ["superAdmin", "logístico", "auditor"], 
  },
  {
    title: "Módulo Logística",
    path: "/panel/logistica",
    icon: Truck,
    roles: ["superAdmin", "logístico"],
  },
  {
    title: "Módulo Auditoría",
    path: "/panel/auditoria",
    icon: ShieldCheck,
    roles: ["superAdmin", "auditor"],
  },
];