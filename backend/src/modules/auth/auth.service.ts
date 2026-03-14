import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { correo, password } = loginDto;

    // 1. Buscar al administrador por correo
    const admin = await this.prisma.administradores.findUnique({
      where: { correo },
    });

    if (!admin) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 2. Verificar que la contraseña coincida
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 3. Preparar los datos que irán dentro del token
    const payload = { 
      sub: admin.id, 
      correo: admin.correo, 
      rol: admin.rol 
    };

    // 4. Retornar el token y la información del usuario (excluyendo la contraseña)
    return {
      access_token: await this.jwtService.signAsync(payload),
      admin: {
        id: admin.id,
        nombre: admin.nombre,
        correo: admin.correo,
        rol: admin.rol,
        foto_perfil_url: admin.foto_perfil_url,
      }
    };
  }
}