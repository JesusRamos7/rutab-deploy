import { Module } from '@nestjs/common';
import { VehiculosController } from './vehiculos/vehiculos.controller';
import { VehiculosService } from './vehiculos/vehiculos.service';
import { ClientesController } from './clientes/clientes.controller';
import { ClientesService } from './clientes/clientes.service';
import { PrismaModule } from '../../database/prisma.module'; 

@Module({
  imports: [PrismaModule], // Importamos el módulo de base de datos para usar Prisma
  controllers: [
    VehiculosController, 
    ClientesController
  ],
  providers: [
    VehiculosService, 
    ClientesService
  ],
})
export class MaintenanceModule {}