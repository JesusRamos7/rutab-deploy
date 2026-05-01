// src/modules/dashboard/dashboard.controller.ts
import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats() {
    return await this.dashboardService.getDailyStats();
  }

  @Get('operacion-activa')
  async getActiveOperation() {
    return await this.dashboardService.getActiveOperations();
  }
}