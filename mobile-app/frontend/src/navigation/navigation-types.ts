// /mobile-app/frontend/src/navigation/navigation-types.ts

// 1. Enum para nombres de rutas (Evita errores de escritura)
export enum RootRoutes {
  AUTH_STACK = 'AuthStack',
  MAIN_DRAWER = 'MainDrawer',
}

export enum AuthRoutes {
  LOGIN = 'Login',
}

export enum MainRoutes {
  ROUTES_STACK = 'RoutesStack',
  PROFILE = 'Profile',
}

export enum RoutesRoutes {
  HOME = 'RoutesHome',
  DELIVERY_EVIDENCE = 'DeliveryEvidence',
  REPORT_INCIDENT = 'ReportIncident',
}

// 2. Definición de parámetros por pantalla (Para navigation.navigate)
export type RoutesStackParamList = {
  [RoutesRoutes.HOME]: undefined;
  [RoutesRoutes.DELIVERY_EVIDENCE]: {
    pedidoId: string;
    cliente: string;
    clientLat: number; // <--- Nuevo
    clientLng: number; // <--- Nuevo
  };

  // Y aquí para cuando saltemos a la pantalla de reporte
  [RoutesRoutes.REPORT_INCIDENT]: {
    pedidoId: string;
    cliente: string;
    rutaId: string;
    clientLat: number; // <--- Nuevo
    clientLng: number; // <--- Nuevo
  };
};

export type MainDrawerParamList = {
  [MainRoutes.ROUTES_STACK]: undefined;
  [MainRoutes.PROFILE]: undefined;
};
