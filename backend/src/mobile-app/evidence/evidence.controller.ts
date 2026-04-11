// /backend/src/mobile-app/evidence/evidence.controller.ts

import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EvidenceService } from './evidence.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Controller('mobile-app/evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post('upload')
  @Roles('chofer')
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @Body() dto: CreateEvidenceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.evidenceService.saveEvidence(dto, file);
  }

  @Post('incident')
  @Roles('chofer')
  async createIncident(@Body() dto: CreateIncidentDto) {
    return this.evidenceService.saveIncident(dto);
  }
}
