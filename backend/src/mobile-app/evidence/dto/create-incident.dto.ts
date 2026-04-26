// /backend/src/mobile-app/evidence/dto/create-incident.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsNumber,
  IsOptional,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIncidentDto {

  @IsUUID()
  @IsOptional() // <-- Clave para evitar el Error 400
  pedidoId?: string;

  @IsUUID()
  @IsNotEmpty()
  rutaId: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @Type(() => Number) // <-- Transforma el string del FormData a número
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsOptional()
  @IsIn(['abierta', 'urgente', 'resuelta'])
  estado_incidencia?: string; 
}
