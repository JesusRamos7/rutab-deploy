// src/common/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard de Autorización Basado en Roles (RBAC).
 * Valida que el usuario autenticado posea los privilegios necesarios para ejecutar una acción.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determina si el usuario tiene permiso para acceder al recurso solicitado.
   * Se ejecuta después del JwtAuthGuard para asegurar que el objeto 'user' ya esté disponible.
   */
  canActivate(context: ExecutionContext): boolean {
    /**
     * Extracción de roles requeridos.
     * El Reflector busca los metadatos 'roles' definidos en el controlador o en el método.
     */
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no se han definido roles específicos, la ruta se considera permitida para cualquier usuario autenticado
    if (!requiredRoles) {
      return true;
    }

    /**
     * Recuperación del usuario desde la petición HTTP.
     * Nota: El objeto 'user' es inyectado previamente por la estrategia de Passport (JWT).
     */
    const { user } = context.switchToHttp().getRequest();

    /**
     * Validación de privilegios:
     * Verifica si el rol asignado al usuario en la base de datos coincide con alguno
     * de los roles exigidos por el decorador @Roles().
     */
    return requiredRoles.some((role) => user?.rol === role);
  }
}
