// /backend/src/mobile-app/evidence/dto/create-incident.dto.ts

import { IsNotEmpty, IsString, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIncidentDto {
  @IsUUID()
  @IsNotEmpty()
  pedidoId: string;

  @IsUUID()
  @IsNotEmpty()
  rutaId: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  // Transformamos de String a Number (porque vienen de un FormData o JSON)
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
