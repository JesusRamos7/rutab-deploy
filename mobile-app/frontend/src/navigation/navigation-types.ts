// src/navigation/navigation-types.ts

// 1. Enum para nombres de rutas (Evita errores de escritura)
export enum RootRoutes {
  AUTH_STACK = "AuthStack",
  MAIN_DRAWER = "MainDrawer",
}

export enum AuthRoutes {
  LOGIN = "Login",
}

export enum MainRoutes {
  DASHBOARD_STACK = "DashboardStack",
  PROFILE = "Profile",
}

export enum DashboardRoutes {
  HOME = "DashboardHome",
  DETAIL = "DashboardDetail",
}

// 2. Definición de parámetros por pantalla (Para navigation.navigate)
export type DashboardStackParamList = {
  [DashboardRoutes.HOME]: undefined;
  [DashboardRoutes.DETAIL]: { id: string }; 
};

export type MainDrawerParamList = {
  [MainRoutes.DASHBOARD_STACK]: undefined;
  [MainRoutes.PROFILE]: undefined;
};