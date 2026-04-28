// src/modules/monitoring/monitoring.module.ts
import { Module } from '@nestjs/common';
import { MonitoringGateway } from './gateways/monitoring.gateway';
import { MonitoringService } from './services/monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { RedisModule } from '../../mobile-app/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [MonitoringController],
  providers: [MonitoringGateway, MonitoringService],
  exports: [MonitoringGateway], // Exportamos el gateway para usarlo en RoutesService
})
export class MonitoringModule {}