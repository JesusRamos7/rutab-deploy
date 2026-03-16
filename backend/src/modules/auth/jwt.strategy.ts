import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Extrae el token de la cabecera 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // IMPORTANTE: Esto debe coincidir con el secreto que usas en tu JwtModule
      secretOrKey: process.env.JWT_SECRET || 'secreto_temporal', 
    });
  }

  // Si el token es válido, NestJS ejecuta esta función automáticamente
  async validate(payload: any) {
    // Retornamos los datos tal cual los guardamos en el auth.service.ts
    // NestJS automáticamente pondrá esto dentro de "req.user"
    return { userId: payload.sub, correo: payload.correo, rol: payload.rol };
  }
}