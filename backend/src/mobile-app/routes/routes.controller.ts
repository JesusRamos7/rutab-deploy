// src/mobile-app/routes/routes.controller.ts

import { Controller, Get, Req } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('mobile-app/routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get('active')
  @Roles('chofer') // Solo los choferes pueden ver su ruta
  async getMyRoute(@Req() req: any) {
    // El id viene del JWT decodificado por el JwtAuthGuard
    const choferId = req.user.id;
    return this.routesService.getActiveRoute(choferId);
  }
}
