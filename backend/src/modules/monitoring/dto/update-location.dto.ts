// src/modules/monitoring/dto/update-location.dto.ts
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class UpdateLocationDto {
  @IsUUID()
  rutaId: string;

  @IsNumber()
  latitud: number;

  @IsNumber()
  longitud: number;

  @IsNumber()
  velocidad: number; // km/h enviada por el GPS del cel
}