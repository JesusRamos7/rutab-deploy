import { Injectable, ConflictException, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/database/prisma/prisma.service";
import { CreateOrdersDto } from "./dto/create-orders.dto";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrdersDto) {
    const { cliente_id, ...orderData } = createOrderDto;

    // Validar si el cliente existe 
    const clientExists = await this.prisma.clientes.findUnique({
      where: { id: cliente_id },
    });

    if (!clientExists) {
      throw new NotFoundException(`El cliente con ID ${cliente_id} no existe.`);
    }

    try {
      // Crear el pedido
      return await this.prisma.pedidos.create({
        data: {
          ...orderData,
          clientes: {
            connect: { id: cliente_id }, // Conectamos con la relación de Prisma
          },
        },
        include: {
          clientes: true, // Esto devuelve el objeto cliente junto con el pedido creado
        },
      });
    } catch (error) {
      // Manejo de errores de base de datos
      throw new BadRequestException('Error al crear el pedido. Verifica los datos.');
    }
  }

  async findAll() {
    return this.prisma.pedidos.findMany({
      include: {
        clientes: true,
        detalles_ruta: true,
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.pedidos.findUnique({
      where: { id },
      include: {
        clientes: true,
        detalles_ruta: true,
        evidencias: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado.`);
    }

    return order;
  }

  async update(id: string, data: Partial<CreateOrdersDto>) {
    const pedidoActual = await this.prisma.pedidos.findUnique({
        where: { id },
    });
    if (!pedidoActual) throw new NotFoundException('Pedido no encontrado.');

    return this.prisma.pedidos.update({
        where: { id },
        data,
    });
  }

  // Sin remove, solo cambiamos el estado del pedido a cancelado
  
}