// /backend/src/modules/optimization/dto/optimization.dto.ts

import {
  IsUUID,
  IsDateString,
  IsArray,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

/**
 * Parámetros para la solicitud inicial de agrupación geográfica (Clustering).
 * Valida que el vehículo exista y la fecha tenga un formato de cadena válido.
 */
export class ClusteringRequestDto {
  @IsUUID()
  vehiculoId: string;

  @IsDateString()
  fechaProgramada: string;
}

/**
 * Representación simplificada de un pedido geolocalizado.
 * Utilizado para cálculos de distancia y visualización en el mapa.
 */
export interface PuntoPedido {
  id: string;
  cliente: string;
  codigoRastreo: string;
  lat: number;
  lng: number;
}

/**
 * Resultado de una secuencia de entrega optimizada.
 * Incluye la lista de pedidos en orden y las métricas estimadas de la ruta.
 */
export interface DetalleRutaOrdenado {
  pedidos: PuntoPedido[];
  distanciaMetros: number;
  duracionSegundos: number;
}

/**
 * Coordenadas de los puntos centrales de cada grupo.
 * Sirven como referencia para el algoritmo de asignación de zonas.
 */
export interface OrdenClustersRequest {
  centroides: {
    clusterId: number;
    lat: number;
    lng: number;
  }[];
}

/**
 * Datos requeridos para la persistencia final de la ruta optimizada.
 * Define el orden definitivo de los IDs de pedidos y las métricas totales del recorrido.
 */
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
