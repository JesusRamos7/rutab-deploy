import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { Roles } from '../../../common/decorators/roles.decorator'; // Ajusta la ruta
import { Public } from '../../../common/decorators/public.decorator'; // Ajusta la ruta

@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Post()
  @Roles('superAdmin', 'logístico') // Solo estos roles pueden crear vehículos
  create(@Body() createVehiculoDto: CreateVehiculoDto) {
    return this.vehiculosService.create(createVehiculoDto);
  }

  @Get()
  // No necesita @UseGuards porque es GLOBAL. 
  // Requiere token por defecto.
  findAll() {
    return this.vehiculosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiculosService.findOne(id);
  }

  @Patch(':id')
  @Roles('superAdmin', 'logístico') // Solo el admin puede editar
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateVehiculoDto>) {
    return this.vehiculosService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('admin') // Solo el admin puede eliminar
  remove(@Param('id') id: string) {
    return this.vehiculosService.remove(id);
  }
}