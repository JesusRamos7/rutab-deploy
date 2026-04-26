// /backend/src/mobile-app/evidence/dto/update-incident.dto.ts

import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateIncidentDto {
  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  @IsIn(['abierta', 'urgente', 'resuelta'])
  estado_incidencia?: string;

  @IsOptional()
  @IsString()
  tipo?: string;

  // Nota: La foto_url se manejará en el servicio si se sube una nueva
}
