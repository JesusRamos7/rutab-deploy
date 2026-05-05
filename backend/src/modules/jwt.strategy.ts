// src/modules/jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Estrategia de Validación JWT.
 * Implementa la lógica necesaria para extraer y verificar tokens Bearer
 * en cada petición entrante a rutas protegidas.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    /**
     * Configuración de la estrategia:
     * - jwtFromRequest: Define dónde buscar el token (Cabecera Authorization: Bearer).
     * - ignoreExpiration: Rechaza automáticamente tokens cuya fecha 'exp' haya pasado.
     * - secretOrKey: Clave simétrica para validar la firma del token.
     */
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Método de Validación Post-Verificación.
   * Se ejecuta únicamente si la firma del token es válida y no ha expirado.
   * * @param payload - Contenido decodificado del JWT (proveniente del AuthService).
   * @returns Un objeto que NestJS inyectará automáticamente en 'req.user'.
   */
  async validate(payload: any) {
    /**
     * Mapeo del Payload al Objeto User:
     * - userId: Recuperado de 'sub' (Subject).
     * - correo: Identificador del usuario.
     * - rol: Clave fundamental para el funcionamiento del RolesGuard (RBAC).
     */
    return {
      userId: payload.sub,
      correo: payload.correo,
      rol: payload.rol,
    };
  }
}
