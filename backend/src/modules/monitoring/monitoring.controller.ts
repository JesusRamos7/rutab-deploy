// src/modules/monitoring/monitoring.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { MonitoringService } from './services/monitoring.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('monitoring')
@UseGuards(JwtAuthGuard) 
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('active-fleet')
  async getActiveFleet() {
    // Este método llama a la lógica que escribimos en el Service
    return await this.monitoringService.getActiveFleetStatus();
  }
}