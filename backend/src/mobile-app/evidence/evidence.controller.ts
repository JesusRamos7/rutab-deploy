// /backend/src/mobile-app/evidence/evidence.controller.ts

import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Patch,
  Param,
  ParseUUIDPipe,
  Get,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EvidenceService } from './evidence.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';

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
  @UseInterceptors(FileInterceptor('photo')) // Habilitamos la subida de foto
  async createIncident(
    @Body() dto: CreateIncidentDto,
    @UploadedFile() file?: Express.Multer.File, // La foto es opcional en incidentes de vía
  ) {
    return this.evidenceService.saveIncident(dto, file);
  }

  @Get('incidents')
  @Roles('chofer')
  async getMyIncidents(@Req() req: any) {
    // El ID del chofer viene del JWT (inyectado por el Guard)
    return this.evidenceService.getIncidentsByChofer(req.user.userId);
  }

  @Patch('incident/:id')
  @Roles('chofer')
  async updateIncident(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.evidenceService.updateIncident(id, dto);
  }
}
