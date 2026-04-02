import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './src/database/prisma/prisma.module';
import { AuthModule } from './src/modules/auth/auth.module';
import { VehiclesModule } from './src/modules/vehicles/vehicles.module';
import { JwtAuthGuard } from './src/common/guards/jwt-auth.guard';
import { RolesGuard } from './src/common/guards/roles.guard';
import { CustomersModule } from './src/modules/customers/customers.module';
import { DriversModule } from './src/modules/drivers/drivers.module';
import { OptimizacionModule } from './src/modules/optimizacion/optimizacion.module';
import { OrdersModule } from './src/modules/orders/orders.module';

@Module({
  imports: [PrismaModule, AuthModule, VehiclesModule, CustomersModule, DriversModule, OptimizacionModule, OrdersModule],
  controllers: [AppController],
  providers: [
    AppService,
    // PRIMER GUARD GLOBAL: Protege todo con JWT
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // SEGUNDO GUARD GLOBAL: Valida roles si existen
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}