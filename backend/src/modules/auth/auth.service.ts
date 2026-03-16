// backend/src/modules/auth/auth.service.ts

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
    const { correo, password, tipoAcceso } = loginDto;

    // ---------------------------------------------------------
    // CASO 1: EL LOGIN VIENE DEL PANEL WEB (ADMINISTRADORES)
    // ---------------------------------------------------------
    if (tipoAcceso === 'ADMIN') {
      const admin = await this.prisma.administradores.findUnique({
        where: { correo },
      });

      if (!admin) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      const payload = { sub: admin.id, correo: admin.correo, rol: admin.rol };
      
      return {
        access_token: await this.jwtService.signAsync(payload),
        tipo: 'ADMIN',
        usuario: {
          id: admin.id,
          nombre: admin.nombre,
          correo: admin.correo,
          rol: admin.rol,
          foto_perfil_url: admin.foto_perfil_url,
        }
      };
    }

    // ---------------------------------------------------------
    // CASO 2: EL LOGIN VIENE DE LA APP MÓVIL (CHOFERES)
    // ---------------------------------------------------------
    if (tipoAcceso === 'CHOFER') {
      const chofer = await this.prisma.choferes.findUnique({
        where: { correo },
      });

      if (!chofer) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      const isPasswordValid = await bcrypt.compare(password, chofer.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      // Los choferes no tienen campo rol en BD, se lo asignamos por defecto
      const payload = { sub: chofer.id, correo: chofer.correo, rol: 'CHOFER' };

      return {
        access_token: await this.jwtService.signAsync(payload),
        tipo: 'CHOFER',
        usuario: {
          id: chofer.id,
          nombre: chofer.nombre,
          correo: chofer.correo,
          licencia: chofer.licencia,
          telefono: chofer.telefono,
          foto_perfil_url: chofer.foto_perfil_url,
          rol: 'CHOFER', 
        }
      };
    }

    // ---------------------------------------------------------
    // CASO 3: TIPO DE ACCESO DESCONOCIDO O FALTANTE
    // ---------------------------------------------------------
    throw new UnauthorizedException('Petición de inicio de sesión inválida');
  }
}