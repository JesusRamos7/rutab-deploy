// /backend/src/mobile-app/routes/dto/update-location.dto.ts
import { IsNumber, IsUUID, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateLocationDto {
  @IsUUID()
  rutaId: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  velocidad?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  bateria?: number;
}
