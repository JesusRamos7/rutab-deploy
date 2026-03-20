// src/modules/vehicles/vehicles.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { JwtStrategy } from '../jwt.strategy';

/**
 * Módulo de Gestión de Vehículos.
 * Encapsula la lógica de negocio, controladores y configuración de seguridad
 * necesaria para operar sobre el inventario de unidades.
 */
@Module({
  imports: [
    /**
     * PassportModule: Provee las bases para la integración de estrategias
     * de autenticación en este módulo.
     */
    PassportModule,

    /**
     * JwtModule: Configuración local para la validación de tokens.
     * Es vital que la 'secret' coincida con la utilizada en el AuthModule
     * para que la validación sea exitosa.
     */
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secreto_temporal',
      signOptions: { expiresIn: '1d' },
    }),
  ],

  /**
   * Controllers: Registra el controlador REST para que NestJS exponga los
   * endpoints definidos bajo el prefijo '/vehicles'.
   */
  controllers: [VehiclesController],

  /**
   * Providers:
   * - VehiclesService: Lógica CRUD y conexión con Prisma.
   * - JwtStrategy: Requerido para procesar la identidad del usuario en cada petición.
   */
  providers: [VehiclesService, JwtStrategy],

  /**
   * Exports: Al exportar estos componentes, permites que otros módulos puedan
   * inyectar el servicio de vehículos o reutilizar la lógica de protección de rutas.
   */
  exports: [PassportModule, JwtStrategy],
})
export class VehiclesModule {}
