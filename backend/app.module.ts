import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './src/database/prisma/prisma.module';
import { AuthModule } from './src/modules/auth/auth.module';
import { VehiclesModule } from './src/modules/vehicles/vehicles.module';
import { JwtAuthGuard } from './src/common/guards/jwt-auth.guard';
import { RolesGuard } from './src/common/guards/roles.guard';
import { CustomersModule } from 'src/modules/customers/customers.module';
import { DriversModule } from 'src/modules/drivers/drivers.module';
import { OrdersModule } from './src/modules/orders/orders.module';
import { OptimizacionModule } from 'src/modules/optimization/optimization.module';
import { RoutesModule } from 'src/mobile-app/routes/routes.module';
import { EvidenceModule } from 'src/mobile-app/evidence/evidence.module';
import { EvidencesModule } from 'src/modules/evidences/evidences.module';
import { MonitoringModule } from 'src/modules/monitoring/monitoring.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    VehiclesModule,
    CustomersModule,
    DriversModule,
    OrdersModule,
    OptimizacionModule,
    RoutesModule,
    EvidencesModule,
    MonitoringModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}