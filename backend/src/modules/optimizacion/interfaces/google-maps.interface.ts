// /backend/src/modules/optimizacion/interfaces/google-maps.interface.ts

export interface GoogleDirectionsResponse {
  routes: {
    waypoint_order: number[]; // Este es el array que nos dice el orden óptimo
    legs: any[];
  }[];
  status: string;
}