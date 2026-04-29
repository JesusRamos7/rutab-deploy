// /frontend/src/features/road-incidents/types/road-incidents.types.ts

export interface Incident {
  id: string;
  tipo: string;
  descripcion: string;
  estado: string;
  fotoUrl?: string;
  pedidoId?: string;
  rutaId: string;
  createdAt: string;
  latitude: number;
  longitude: number;
  codigoPedido?: string;
  categoria?: string;
}