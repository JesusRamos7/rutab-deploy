import { IsString, IsNotEmpty, IsOptional, IsNumber, Matches } from 'class-validator';

export class CreateClienteDto {

  @IsString()
  @IsOptional()
  nombre: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

   @IsString()
  @IsOptional()
  correo?: string;

  // Coordenadas

  // pedidos
}