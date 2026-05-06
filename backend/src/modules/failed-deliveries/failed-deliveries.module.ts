import { Module } from '@nestjs/common';
import { FailedDeliveriesController } from './failed-deliveries.controller';
import { FailedDeliveriesService } from './failed-deliveries.service';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FailedDeliveriesController],
  providers: [FailedDeliveriesService],
})
export class FailedDeliveriesModule {}
