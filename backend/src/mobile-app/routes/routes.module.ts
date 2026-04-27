// /backend/src/mobile-app/routes/routes.module.ts

import { forwardRef, Module } from '@nestjs/common';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { RedisModule } from '../redis/redis.module';
import { MonitoringModule } from 'src/modules/monitoring/monitoring.module';

@Module({
  imports: [
    // Usamos forwardRef para evitar dependencia circular entre RoutesModule y MonitoringModule
    forwardRef(() => MonitoringModule), 
    forwardRef(() => RedisModule) 
  ], 
  controllers: [RoutesController],
  providers: [RoutesService],
})

export class RoutesModule {}
