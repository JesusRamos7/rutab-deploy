import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [PrismaModule, AuthModule, VehiclesModule],
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