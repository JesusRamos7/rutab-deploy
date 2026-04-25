// /backend/src/mobile-app/evidence/evidence.module.ts

import { Module } from '@nestjs/common';

import { EvidencesController } from './evidences.controller';
import { EvidencesService } from './evidences.service';

@Module({
  controllers: [EvidencesController],
  providers: [EvidencesService],
})
export class EvidencesModule {}
