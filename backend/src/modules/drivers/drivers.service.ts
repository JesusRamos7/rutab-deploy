import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateDriverDto } from './dto/create-drivers.dto';
import * as bcrypt from 'bcrypt'; // instalar bcrypt con npm install bcrypt && npm install -D @types/bcrypt

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async create(createDriverDto: CreateDriverDto) {
    const { correo, password, ...rest } = createDriverDto;

    const correoExistente = await this.prisma.choferes.findUnique({
      where: { correo },
    });

    if (correoExistente) {
      throw new ConflictException('Este correo electrónico ya está registrado');
    }

    // Encriptar la contraseña usando bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear el chofer con la contraseña hasheada
    return this.prisma.choferes.create({
      data: {
        ...rest,
        correo,
        password: hashedPassword,
      },
    });
  }

  async findAll(){
    return this.prisma.choferes.findMany();
  }

  async findOne(id: string) {
    const drivers = await this.prisma.choferes.findUnique({ where: { id } });
    if (!drivers) throw new NotFoundException('Chofer no encontrado.');

    return drivers;
  }

  async update(id: string, data: Partial <CreateDriverDto>){
    const existe = await this.prisma.choferes.findUnique({ where: { id }});
    if (!existe) throw new NotFoundException('Chofer no encontrado.');

    return this.prisma.choferes.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const driver = await this.prisma.choferes.findUnique({ where: {id}});
    if(!driver) throw new NotFoundException('Chofer no encontrado.');

    return this.prisma.choferes.delete({ where: { id }});
  }
}