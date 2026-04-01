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
  ROUTES_STACK = "RoutesStack",
  PROFILE = "Profile",
}

export enum RoutesRoutes {
  HOME = "RoutesHome",
  DETAIL = "RoutesDetail",
}

// 2. Definición de parámetros por pantalla (Para navigation.navigate)
export type RoutesStackParamList = {
  [RoutesRoutes.HOME]: undefined;
  [RoutesRoutes.DETAIL]: { id: string }; 
};

export type MainDrawerParamList = {
  [MainRoutes.ROUTES_STACK]: undefined;
  [MainRoutes.PROFILE]: undefined;
};