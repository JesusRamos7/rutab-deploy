// /backend/src/mobile-app/routes/routes.module.ts

import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [RoutesController],
  providers: [RoutesService],
})

export class RoutesModule {}
