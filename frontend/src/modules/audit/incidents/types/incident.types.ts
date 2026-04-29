// frontend/src/modules/audit/incidents/types/incident.types.ts

export type EstadoIncidencia =
  | "pendiente"
  | "abierta"
  | "urgente"
  | "resuelta"
  | string;

export interface Incident {
  id: string;
  tipo: string;
  descripcion: string;
  fotoUrl: string | null;
  fotoUrlFirmada: string | null;
  estado: EstadoIncidencia;
  categoria: string;
  createdAt: string;
  lng: number | null;
  lat: number | null;
  choferId: string | null;
  choferNombre: string | null;
  choferCorreo: string | null;
}

export interface IncidentFilters {
  estado?: string;
  categoria?: string;
  fecha?: string;
  choferCorreo?: string;
}
