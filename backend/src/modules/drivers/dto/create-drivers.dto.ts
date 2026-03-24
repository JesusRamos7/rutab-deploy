import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  licencia?: string;

  @IsEmail() 
  correo: string;

  @IsString()
  @MinLength(6) // Seguridad 
  password: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  foto_perfil_url?: string;


    // historial rastreo

    // incidencias

    // rutas
}