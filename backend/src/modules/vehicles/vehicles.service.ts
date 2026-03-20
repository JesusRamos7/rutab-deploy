// src/modules/vehicles/vehicles.service.ts

import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

/**
 * Servicio encargado de la lógica de negocio y persistencia de vehículos.
 * Utiliza PrismaService para interactuar con el motor de base de datos.
 */
@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registra una nueva unidad en el sistema.
   * @param data - Datos validados del vehículo.
   * @throws ConflictException - Si las placas ya existen en la base de datos.
   */
  async create(data: CreateVehicleDto) {
    // Verificación de unicidad: Las placas son el identificador natural del vehículo
    const existe = await this.prisma.vehiculos.findUnique({
      where: { placas: data.placas },
    });

    if (existe) {
      throw new ConflictException('Las placas ya están registradas');
    }

    return this.prisma.vehiculos.create({ data });
  }

  /**
   * Recupera el listado completo de vehículos.
   */
  async findAll() {
    return this.prisma.vehiculos.findMany();
  }

  /**
   * Busca una unidad específica por su identificador único (UUID).
   * @param id - ID del vehículo.
   */
  async findOne(id: string) {
    return this.prisma.vehiculos.findUnique({
      where: { id },
    });
  }

  /**
   * Actualiza los datos de un vehículo existente.
   * @param id - ID del vehículo a modificar.
   * @param data - Fragmento de datos a actualizar (Partial).
   * @throws NotFoundException - Si el vehículo no existe.
   */
  async update(id: string, data: Partial<CreateVehicleDto>) {
    const existe = await this.prisma.vehiculos.findUnique({
      where: { id },
    });

    if (!existe) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    return this.prisma.vehiculos.update({
      where: { id },
      data,
    });
  }

  /**
   * Elimina un vehículo del sistema de forma permanente.
   * @param id - ID del vehículo a remover.
   * @throws NotFoundException - Si el ID no corresponde a ninguna unidad activa.
   */
  async remove(id: string) {
    // Verificación preventiva antes de la operación de borrado
    const vehiculo = await this.prisma.vehiculos.findUnique({
      where: { id },
    });

    if (!vehiculo) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    return this.prisma.vehiculos.delete({
      where: { id },
    });
  }
}
