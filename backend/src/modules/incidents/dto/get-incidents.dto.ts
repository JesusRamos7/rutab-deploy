import { IsOptional, IsString, IsDateString } from 'class-validator';

export class GetIncidentsDto {
  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  choferCorreo?: string;
}
