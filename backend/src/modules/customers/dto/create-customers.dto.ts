import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEmail } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  direccion: string;

  @IsEmail({}, { message: 'El formato del correo es inválido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' }) // Cambiado: de @IsOptional a @IsNotEmpty
  correo: string;

  // Campos para manejar la ubicación
  @IsNumber()
  @IsNotEmpty({ message: 'La latitud es obligatoria' })
  latitude: number;

  @IsNumber()
  @IsNotEmpty({ message: 'La longitud es obligatoria' })
  longitude: number;

  @IsString()
  @IsOptional()
  codigo?: string;

  @IsString()
  @IsOptional()
  contacto?: string;

  @IsString()
  @IsOptional()
  estatus?: string;
}