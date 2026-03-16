// backend/src/auth/dto/login.dto.ts
export class LoginDto {
  correo: string;
  password: string;
  tipoAcceso: 'ADMIN' | 'CHOFER'; // <- Añadimos el tipo de acceso esperado
}