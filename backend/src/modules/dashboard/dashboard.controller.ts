// src/modules/dashboard/dashboard.controller.ts
import { Controller, Get, Res, BadRequestException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Response } from 'express';
import { ReportService } from './report.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly reportService: ReportService
  ) { }

  @Get('stats')
  async getStats() {
    return await this.dashboardService.getDailyStats();
  }

  @Get('operacion-activa')
  async getActiveOperation() {
    return await this.dashboardService.getActiveOperations();
  }

 @Get('export/pdf')
async exportPDF(@Res() res: Response) {
    const data = await this.dashboardService.getDailyStats();

    // VALIDACIÓN: Si no hay rutas ni pedidos, avisamos al usuario
    if (data.rutasActivas === 0 && data.pedidos.totales === 0) {
        throw new BadRequestException('No hay actividad registrada el día de hoy para generar un reporte.');
    }

    const pdfBuffer = await this.reportService.generateDailyPDF(data);
    
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=reporte-rutab.pdf',
    });
    
    res.end(pdfBuffer);
}
}