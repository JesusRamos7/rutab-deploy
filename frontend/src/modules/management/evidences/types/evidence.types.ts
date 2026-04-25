// src/modules/management/evidences/types/evidence.types.ts

export type EstadoEvidencia = 'auto aprobada' | 'alerta' | 'aprobada';

export interface Evidence {
  id: string;
  pedidoId: string;
  fotoUrl: string;
  firmaUrl: string;
  estado: EstadoEvidencia;
  fechaHora: string;
  codigoRastreo: string;
  clienteNombre: string;
  choferId: string | null;
  choferNombre: string | null;
  choferCorreo: string | null;
  distanciaMetros: number;
}

export interface EvidenceFilters {
  estado?: string;
  pedidoId?: string;
  choferCorreo?: string;
  fecha?: string; 
}