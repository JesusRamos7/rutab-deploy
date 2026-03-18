import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El formato del correo es inválido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  @IsEnum(['ADMIN', 'CHOFER'], { 
    message: 'El tipo de acceso debe ser ADMIN o CHOFER' 
  })
  @IsNotEmpty()
  tipoAcceso: 'ADMIN' | 'CHOFER';
}