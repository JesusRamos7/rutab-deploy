// /backend/src/modules/optimizacion/optimizacion.module.ts

import { Module } from '@nestjs/common';
import { OptimizacionController } from './optimizacion.controller';
import { OptimizacionService } from './optimizacion.service';
import { GoogleMapsService } from './google-maps.service';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OptimizacionController],
  providers: [OptimizacionService, GoogleMapsService],
  exports: [OptimizacionService],
})
export class OptimizacionModule {}
