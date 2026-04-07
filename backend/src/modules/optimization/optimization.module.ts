// /backend/src/modules/optimization/optimization.module.ts

import { Module } from '@nestjs/common';
import { OptimizacionController } from './optimization.controller';
import { OptimizacionService } from './optimization.service';
import { GoogleMapsService } from './google-maps.service';
import { PrismaModule } from '../../database/prisma/prisma.module';

/**
 * Módulo de Optimización: Orquestador de la lógica de geolocalización,
 * clustering de pedidos y cálculo de rutas eficientes.
 */
@Module({
  /** Dependencias de otros módulos del sistema */
  imports: [PrismaModule],

  /** Definición del punto de entrada para las peticiones HTTP del módulo */
  controllers: [OptimizacionController],

  /** * Servicios encargados de la lógica de negocio y la comunicación
   * con proveedores externos de mapas.
   */
  providers: [OptimizacionService, GoogleMapsService],

  /** Expone el servicio de optimización para ser utilizado en otros módulos de la aplicación */
  exports: [OptimizacionService],
})
export class OptimizacionModule {}
