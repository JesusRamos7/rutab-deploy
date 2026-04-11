// /backend/src/mobile-app/evidence/dto/create-evidence.dto.ts

import { IsNotEmpty, IsString, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer'; // Importante

export class CreateEvidenceDto {
  @IsUUID()
  @IsNotEmpty()
  pedidoId: string;

  @IsString()
  @IsNotEmpty()
  firmaBase64: string;

  @Type(() => Number) // <--- Fuerza la conversión de String a Number
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @Type(() => Number) // <--- Fuerza la conversión de String a Number
  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
