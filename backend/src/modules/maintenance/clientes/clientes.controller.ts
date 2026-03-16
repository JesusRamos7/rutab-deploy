import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { ClientesService } from './clientes.service'
import { CreateVehiculoDto } from '../vehiculos/dto/create-vehiculo.dto'

@Controller('clientes')
export class ClientesController {
    
}