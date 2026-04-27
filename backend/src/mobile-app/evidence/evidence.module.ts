// /backend/src/mobile-app/evidence/evidence.module.ts

import { forwardRef, Module } from '@nestjs/common';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';
import { MonitoringModule } from 'src/modules/monitoring/monitoring.module';

@Module({
  controllers: [EvidenceController],
  providers: [EvidenceService],
  imports: [forwardRef(() => MonitoringModule)],
})
export class EvidenceModule {}
