import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { Roles } from '../../common/decorators/roles.decorator'; // Ajusta la ruta
import { Public } from '../../common/decorators/public.decorator'; // Ajusta la ruta

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles('superAdmin', 'logístico') // Solo estos roles pueden crear vehículos
  create(@Body() createVehiculoDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehiculoDto);
  }

  @Get()
  // No necesita @UseGuards porque es GLOBAL. 
  // Requiere token por defecto.
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @Roles('superAdmin', 'logístico') // Solo el admin puede editar
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateVehicleDto>) {
    return this.vehiclesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('superAdmin') // Solo el admin puede eliminar
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}