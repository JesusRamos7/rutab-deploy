import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customers.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const { latitude, longitude, ...rest } = createCustomerDto;

    // Verificar si el correo ya existe
    if (rest.correo) {
      const correoExistente = await this.prisma.clientes.findUnique({
        where: { correo: rest.correo },
      });
      if (correoExistente) {
        throw new ConflictException(
          'Este correo electrónico ya está registrado en otro cliente.',
        );
      }
    }

    // Generación de código CLI-XXX
    const ultimoCliente = await this.prisma.clientes.findFirst({
      orderBy: { created_at: 'desc' },
    });

    let siguienteNumero = 1;
    if (ultimoCliente && ultimoCliente.codigo) {
      const partes = ultimoCliente.codigo.split('-');
      if (partes.length === 2) {
        siguienteNumero = parseInt(partes[1], 10) + 1;
      }
    }
    const codigoGenerado = `CLI-${String(siguienteNumero).padStart(3, '0')}`;

    // Inserción manual con SQL Raw para soportar PostGIS (Geography)
    const result = await this.prisma.$queryRaw<any[]>`
      INSERT INTO clientes (
        nombre, telefono, direccion, correo, codigo, contacto, estatus, coordenadas
      ) VALUES (
        ${rest.nombre}, ${rest.telefono}, ${rest.direccion}, ${rest.correo}, 
        ${codigoGenerado}, ${rest.contacto}, ${rest.estatus}, 
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      ) RETURNING id, nombre, correo, codigo;
    `;

    return result[0];
  }

  async findAll() {
    // Obtenemos latitud y longitud extrayéndolas del tipo geography
    return this.prisma.$queryRaw`
      SELECT 
        id, nombre, telefono, direccion, correo, codigo, contacto, estatus, created_at,
        ST_Y(coordenadas::geometry) as latitude, 
        ST_X(coordenadas::geometry) as longitude
      FROM clientes
      ORDER BY created_at DESC;
    `;
  }

  async findOne(id: string) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        id, nombre, telefono, direccion, correo, codigo, contacto, estatus, created_at,
        ST_Y(coordenadas::geometry) as latitude, 
        ST_X(coordenadas::geometry) as longitude
      FROM clientes
      WHERE id = ${id}::uuid;
    `;

    if (!result || result.length === 0) {
      throw new NotFoundException('Cliente no encontrado.');
    }

    return result[0];
  }

  async update(id: string, updateCustomerDto: Partial<CreateCustomerDto>) {
    const existe = await this.prisma.clientes.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException('Cliente no encontrado.');

    const { latitude, longitude, ...rest } = updateCustomerDto;

    // Actualización con SQL Raw para manejar el campo geography dinámicamente
    await this.prisma.$executeRaw`
      UPDATE clientes
      SET 
        nombre = COALESCE(${rest.nombre}, nombre),
        telefono = COALESCE(${rest.telefono}, telefono),
        direccion = COALESCE(${rest.direccion}, direccion),
        correo = COALESCE(${rest.correo}, correo),
        contacto = COALESCE(${rest.contacto}, contacto),
        estatus = COALESCE(${rest.estatus}, estatus),
        coordenadas = CASE 
          WHEN ${latitude}::float IS NOT NULL AND ${longitude}::float IS NOT NULL 
          THEN ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
          ELSE coordenadas
        END
      WHERE id = ${id}::uuid;
    `;

    return this.findOne(id);
  }

  async remove(id: string) {
    const customer = await this.prisma.clientes.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Cliente no encontrado.');

    return this.prisma.clientes.delete({ where: { id } });
  }
}
