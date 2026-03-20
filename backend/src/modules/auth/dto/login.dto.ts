// src/modules/auth/dto/login.dto.ts

import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';

/**
 * Objeto de Transferencia de Datos (DTO) para el inicio de sesión.
 * Define la estructura y las reglas de validación que deben cumplir las peticiones
 * entrantes al endpoint de autenticación.
 */
export class LoginDto {
  /** * Identificador único del usuario (E-mail).
   * Valida que el string tenga un formato de correo electrónico válido.
   */
  @IsEmail({}, { message: 'El formato del correo es inválido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;

  /** * Contraseña del usuario.
   * Se requiere que sea un string no vacío para proceder con la comparación de hash.
   */
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  /** * Discriminador de Plataforma.
   * Restringe el acceso únicamente a los perfiles permitidos por el sistema:
   * - ADMIN: Acceso al panel administrativo Web.
   * - CHOFER: Acceso a la aplicación móvil.
   */
  @IsEnum(['ADMIN', 'CHOFER'], {
    message: 'El tipo de acceso debe ser ADMIN o CHOFER',
  })
  @IsNotEmpty()
  tipoAcceso: 'ADMIN' | 'CHOFER';
}
