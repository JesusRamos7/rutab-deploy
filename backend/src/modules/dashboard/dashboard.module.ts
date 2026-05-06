import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { DashboardGateway } from './dashboard.gateway';
import { ReportService } from './report.service';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardGateway, ReportService],
  exports: [DashboardService, DashboardGateway], // Exportamos el servicio y el gateway para que puedan ser usados en otros módulos
})
export class DashboardModule {}