// /backend/src/mobile-app/evidence/dto/create-incident.dto.ts

import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

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
}
