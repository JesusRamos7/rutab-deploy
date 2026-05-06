// /backend/src/mobile-app/evidence/evidence.module.ts

import { forwardRef, Module } from '@nestjs/common';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';
import { MonitoringModule } from 'src/modules/monitoring/monitoring.module';
import { DashboardModule } from 'src/modules/dashboard/dashboard.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  controllers: [EvidenceController],
  providers: [EvidenceService],
  imports: [forwardRef(() => MonitoringModule), forwardRef(() => DashboardModule), RedisModule],
})
export class EvidenceModule {}
