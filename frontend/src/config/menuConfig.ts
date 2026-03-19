import {
  LayoutDashboard,
  Truck,
  ShieldCheck,
  Database,
  CarFront,
  Users,
  ShoppingCart,
  LucideIcon,
} from "lucide-react";

export type RolPermitido = "superAdmin" | "logístico" | "auditor" | string;

// Nueva interfaz estricta para los hijos
export interface SubMenuItem {
  title: string;
  path: string; // Aquí es estrictamente un string, resolviendo el error de TS
  icon: LucideIcon; // Añadimos el icono obligatorio
  roles: RolPermitido[];
}

export interface MenuItem {
  title: string;
  icon: LucideIcon;
  path?: string; // Sigue siendo opcional para los padres (como Gestión de Datos)
  roles: RolPermitido[];
  subItems?: SubMenuItem[]; // Usamos la nueva interfaz
}

export const menuConfig: MenuItem[] = [
  {
    title: "Inicio",
    path: "/panel/inicio",
    icon: LayoutDashboard,
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
  {
    title: "Gestión de Datos",
    icon: Database,
    roles: ["superAdmin", "logístico", "auditor"],
    subItems: [
      {
        title: "Vehículos",
        path: "/panel/gestion/vehiculos",
        icon: CarFront, // Añadido
        roles: ["superAdmin", "logístico"],
      },
      {
        title: "Clientes",
        path: "/panel/gestion/clientes",
        icon: Users, // Añadido
        roles: ["superAdmin"],
      },
      {
        title: "Pedidos",
        path: "/panel/gestion/pedidos",
        icon: ShoppingCart, // Añadido
        roles: ["superAdmin", "logístico"],
      },
    ],
  },
];
