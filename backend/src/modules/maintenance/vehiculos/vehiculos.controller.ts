import { Controller, Get, Post, Body, Param, UseGuards, Delete, Patch } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Descomenta si ya quieres usar seguridad

@Controller('vehiculos')
// @UseGuards(JwtAuthGuard) // Si quieres proteger el CRUD desde ya
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Post()
  create(@Body() createVehiculoDto: CreateVehiculoDto) {
    return this.vehiculosService.create(createVehiculoDto);
  }

  @Get()
  findAll() {
    return this.vehiculosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiculosService.findOne(id);
  }

  @Patch(':id')
update(@Param('id') id: string, @Body() updateDto: Partial<CreateVehiculoDto>) {
  return this.vehiculosService.update(id, updateDto);
}

  @Delete(':id')
  remove(@Param('id') id: string) {
  return this.vehiculosService.remove(id);
}
}