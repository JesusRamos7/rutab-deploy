// /backend/src/modules/evidences/evidences.controller.ts
import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EvidencesService } from './evidences.service';
import { EvidenceQueryDto } from './dto/evidence-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('management/evidences')
export class EvidencesController {
  constructor(private readonly evidencesService: EvidencesService) {}

  @Get()
  @Roles('superAdmin', 'auditor', 'logístico')
  async getAll(@Query() query: EvidenceQueryDto) {
    return this.evidencesService.findAll(query);
  }

  @Patch(':id/approve')
  @Roles('superAdmin', 'auditor')
  async approve(@Param('id') id: string) {
    return this.evidencesService.approve(id);
  }
}
