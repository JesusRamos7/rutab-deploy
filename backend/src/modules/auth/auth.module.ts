// src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../jwt.strategy';

/**
 * Módulo de Autenticación.
 * Centraliza la configuración de Passport, la firma de tokens JWT y la
 * inicialización de las estrategias de seguridad.
 */
@Module({
  imports: [
    /**
     * PassportModule: Provee las utilidades básicas para manejar diferentes
     * estrategias de autenticación en NestJS.
     */
    PassportModule,

    /**
     * JwtModule: Configuración del motor de firma y verificación de tokens.
     */
    JwtModule.register({
      /**
       * Secreto de firma: Se recupera de las variables de entorno para
       * garantizar la seguridad del servidor en producción.
       */
      secret: process.env.JWT_SECRET || 'secreto_temporal',
      /**
       * Tiempo de vida del token: Configurado a 24 horas (1d) para
       * equilibrar seguridad y experiencia de usuario.
       */
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  /**
   * Proveedores: Incluye el AuthService (lógica de negocio) y la JwtStrategy
   * para que el motor de Passport pueda interceptar y validar los Bearer Tokens.
   */
  providers: [AuthService, JwtStrategy],
  /**
   * Exportaciones: Permite que otros módulos de la aplicación utilicen los
   * mecanismos de protección de rutas (@UseGuards) sin re-configurar el JWT.
   */
  exports: [PassportModule, JwtStrategy],
})
export class AuthModule {}
