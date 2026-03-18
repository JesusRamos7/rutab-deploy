import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Buscamos qué roles exige la ruta a la que intentan acceder
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Si la ruta no tiene la etiqueta @Roles, dejamos pasar a cualquiera
    if (!requiredRoles) {
      return true;
    }
    
    // 2. Extraemos el usuario que hizo la petición (gracias al JwtStrategy)
    const { user } = context.switchToHttp().getRequest();
    
    // 3. Verificamos si el rol del usuario está dentro de los permitidos
    return requiredRoles.some((role) => user?.rol === role);
  }
}