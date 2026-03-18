import { IsString, IsNotEmpty, IsOptional, IsNumber, Matches } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}-[0-9]{3}-[A-Z]{1}$/, { message: 'Formato de placa inválido' }) // Ejemplo: ABC-123-A
  placas: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsOptional()
  modelo?: string;

  @IsNumber()
  @IsOptional()
  rendimiento_combustible?: number;

  @IsString()
  @IsOptional()
  estatus?: string;

  @IsString()
  @IsOptional()
  foto_unidad_url?: string;
}