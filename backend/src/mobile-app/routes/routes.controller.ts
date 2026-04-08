// backend/src/mobile-app/routes/routes.controller.ts

import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('mobile-app/routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get('active')
  @Roles('chofer')
  async getMyRoute(@Req() req: any) {
    // Accedemos a userId porque así está definido en tu JwtStrategy
    const choferId = req.user?.userId;

    if (!choferId) {
      throw new BadRequestException(
        'ID de chofer no encontrado en el token (userId is missing).',
      );
    }

    return this.routesService.getActiveRoute(choferId);
  }

  @Patch(':id/start')
  @Roles('chofer')
  async startRoute(@Param('id') id: string, @Req() req: any) {
    const choferId = req.user?.userId;
    return this.routesService.startRoute(id, choferId);
  }
}
