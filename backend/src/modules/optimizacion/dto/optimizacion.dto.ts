// /backend/src/modules/optimizacion/dto/optimizacion.dto.ts

import {
  IsUUID,
  IsDateString,
  IsArray,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

// --- PASO 1 y Base ---
export class ClusteringRequestDto {
  @IsUUID()
  vehiculoId: string;

  @IsDateString()
  fechaProgramada: string;
}

export interface PuntoPedido {
  id: string;
  cliente: string;
  codigoRastreo: string;
  lat: number;
  lng: number;
}

// --- PASO 2 y 3 ---
export interface DetalleRutaOrdenado {
  pedidos: PuntoPedido[];
  distanciaMetros: number;
  duracionSegundos: number;
}

export interface OrdenClustersRequest {
  centroides: {
    clusterId: number;
    lat: number;
    lng: number;
  }[];
}

// --- PASO 4 ---
export class PublicarRutaDto {
  @IsUUID()
  rutaId: string;

  @IsArray()
  @IsNotEmpty()
  ordenFinalPedidos: string[];

  @IsNumber()
  distanciaTotalMetros: number;

  @IsNumber()
  duracionTotalSegundos: number;
}
