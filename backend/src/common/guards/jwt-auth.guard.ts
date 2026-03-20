// src/common/guards/jwt-auth.guard.ts

import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard de autenticación JWT.
 * Extiende la funcionalidad de Passport-JWT para integrar el sistema de rutas públicas.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determina si la petición actual puede proceder.
   * Valida metadatos para permitir el acceso anónimo o ejecutar la validación del token.
   */
  canActivate(context: ExecutionContext) {
    /**
     * Busca la presencia del metadato 'isPublic' (vía @Public()).
     * Prioriza la configuración del método (handler) sobre la de la clase (controlador).
     */
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Bypass de seguridad si la ruta es pública
    if (isPublic) {
      return true;
    }

    // Ejecuta la lógica estándar de validación de Passport (JWT Strategy)
    return super.canActivate(context);
  }
}
