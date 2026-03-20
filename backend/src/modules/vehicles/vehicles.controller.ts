// src/modules/vehicles/vehicles.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Controlador de Gestión de Vehículos.
 * Provee la interfaz REST para el mantenimiento de la flota (CRUD).
 * Prefijo de ruta: /vehicles
 */
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  /**
   * Endpoint de Creación.
   * * Acceso restringido: Solo perfiles con atribuciones de gestión operativa.
   */
  @Post()
  @Roles('superAdmin', 'logístico')
  create(@Body() createVehiculoDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehiculoDto);
  }

  /**
   * Endpoint de Consulta Global.
   * * Acceso: Requiere token válido (heredado del Guard Global).
   * Recupera el listado completo de unidades para su visualización en el panel.
   */
  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  /**
   * Endpoint de Consulta Individual.
   * @param id - Identificador único del vehículo.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  /**
   * Endpoint de Actualización Parcial (PATCH).
   * * Acceso restringido: Permite modificar atributos específicos sin reescribir todo el objeto.
   */
  @Patch(':id')
  @Roles('superAdmin', 'logístico')
  update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateVehicleDto>,
  ) {
    return this.vehiclesService.update(id, updateDto);
  }

  /**
   * Endpoint de Eliminación.
   * * Acceso crítico: Solo el nivel jerárquico más alto (superAdmin) puede remover unidades.
   */
  @Delete(':id')
  @Roles('superAdmin')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}
