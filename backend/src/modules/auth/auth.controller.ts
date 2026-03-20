import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // <--- Esta es la "llave" que salta el Guard Global
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // NUEVO: Endpoint para verificar el token y obtener datos frescos
  // No lleva @Public(), por lo que requiere un token válido
  @Get('profile')
  getProfile(@Request() req) {
    // req.user contiene { userId, correo, rol } que viene de JwtStrategy
    return this.authService.getProfile(req.user.userId, req.user.rol);
  }
}
