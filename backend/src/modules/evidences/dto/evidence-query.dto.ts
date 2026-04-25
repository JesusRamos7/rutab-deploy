// /backend/src/modules/evidences/dto/evidence-query.dto.ts
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class EvidenceQueryDto {
  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  pedidoId?: string;

  @IsOptional()
  @IsString()
  choferNombre?: string;
}
