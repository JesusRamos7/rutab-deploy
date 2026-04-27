// src/config/menuConfig.ts

import {
  List,
  Truck,
  ShieldCheck,
  Database,
  Users,
  ShoppingCart,
  LucideIcon,
  UserRound,
  Map,
  Activity,
  Zap,
  FolderCheck,
} from "lucide-react";

/**
 * Tipado de roles permitidos para el control de acceso en la navegación.
 */
export type RolPermitido = "superAdmin" | "logístico" | "auditor" | string;

/**
 * Interfaz para elementos de segundo nivel (Submenús).
 * Requiere estrictamente una ruta y un icono para mantener la consistencia visual.
 */
export interface SubMenuItem {
  title: string;
  path: string;
  icon: LucideIcon;
  roles: RolPermitido[];
}

/**
 * Interfaz para elementos principales del menú.
 * Si contiene 'subItems', el 'path' se vuelve opcional ya que actúa como contenedor.
 */
export interface MenuItem {
  title: string;
  icon: LucideIcon;
  path?: string;
  roles: RolPermitido[];
  subItems?: SubMenuItem[];
}

/**
 * Configuración maestra del menú lateral.
 * Define la estructura, iconos y niveles de acceso por rol para toda la aplicación.
 */
export const menuConfig: MenuItem[] = [
  {
    title: "Inicio",
    path: "/panel/inicio",
    icon: List,
    roles: ["superAdmin", "logístico", "auditor"],
  },
  {
    // Agrupamos todo lo operativo bajo "Operaciones" o "Rutas"
    title: "Rutas y Operaciones",
    icon: Map,
    roles: ["superAdmin", "logístico"],
    subItems: [
      {
        title: "Optimización",
        path: "/panel/optimizacion",
        icon: Zap, // Zap o Map quedan geniales aquí
        roles: ["superAdmin", "logístico"],
      },
      {
        title: "Monitoreo en Vivo",
        path: "/panel/monitoreo",
        icon: Activity, // El pulso de la flota 📈
        roles: ["superAdmin", "logístico"],
      },
    ],
  },
  {
    title: "Auditoría",
    icon: ShieldCheck,
    roles: ["superAdmin", "auditor"],
    subItems: [
      {
        title: "Evidencias",
        path: "/panel/auditoria/evidencias",
        icon: FolderCheck,
        roles: ["superAdmin", "auditor", "logístico"],
      },
    ],
  },
  {
    // Elemento tipo acordeón: no redirige, expande sus subItems
    title: "Gestión de Datos",
    icon: Database,
    roles: ["superAdmin", "logístico", "auditor"],
    subItems: [
      {
        title: "Vehículos",
        path: "/panel/gestion/vehiculos",
        icon: Truck,
        roles: ["superAdmin", "logístico"],
      },
      {
        title: "Conductores",
        path: "/panel/gestion/choferes",
        icon: UserRound,
        roles: ["superAdmin", "logístico"],
      },
      {
        title: "Clientes",
        path: "/panel/gestion/clientes",
        icon: Users,
        roles: ["superAdmin"],
      },
      {
        title: "Pedidos",
        path: "/panel/gestion/pedidos",
        icon: ShoppingCart,
        roles: ["superAdmin", "logístico"],
      },
    ],
  },
];
