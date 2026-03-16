import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy'; // 1. Importamos la estrategia

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secreto_temporal', // ¡Recuerda cambiar esto en producción!
      signOptions: { expiresIn: '1d' }, 
    }),
  ],
  controllers: [AuthController],
  // 2. Agregamos JwtStrategy a los providers para que NestJS lo inicialice
  providers: [AuthService, JwtStrategy], 
  // 3. (Opcional pero recomendado) Exportamos PassportModule y JwtStrategy
  // para que otros módulos puedan usar el decorador @UseGuards(AuthGuard('jwt'))
  exports: [PassportModule, JwtStrategy], 
})
export class AuthModule {}