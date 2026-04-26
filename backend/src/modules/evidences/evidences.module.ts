// /backend/src/modules/evidences/evidences.module.ts

import { Module } from '@nestjs/common';
import { EvidencesController } from './evidences.controller';
import { EvidencesService } from './evidences.service';
import { EvidencesCleanupService } from './evidences-cleanup.service';

@Module({
  controllers: [EvidencesController],
  providers: [
    EvidencesService,
    EvidencesCleanupService, // Servicio encargado del Cron Job
  ],
})
export class EvidencesModule {}
