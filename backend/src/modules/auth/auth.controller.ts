// src/modules/auth/auth.controller.ts

import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';

/**
 * Controlador de Autenticación.
 * Gestiona las peticiones relacionadas con el inicio de sesión y la validación de perfiles.
 * Prefijo de ruta: /auth
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint de Inicio de Sesión.
   * * Acceso: Público (Omitido por el JwtAuthGuard global mediante @Public).
   * Valida las credenciales y el tipo de acceso (ADMIN/CHOFER) para emitir un JWT.
   */
  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Endpoint de Perfil de Usuario.
   * * Acceso: Protegido (Requiere un Bearer Token válido en las cabeceras).
   * Permite obtener la información actualizada del usuario desde la base de datos
   * utilizando los datos extraídos del payload del JWT.
   */
  @Get('profile')
  getProfile(@Request() req) {
    /**
     * Objeto req.user:
     * Inyectado automáticamente por la JwtStrategy tras una validación exitosa.
     * Contiene las propiedades: { userId, correo, rol }.
     */
    return this.authService.getProfile(req.user.userId, req.user.rol);
  }
}
