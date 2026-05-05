import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { FailedDeliveriesService } from './failed-deliveries.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class MarkExtractedDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  codigos: string[];
}

@Controller('failed-deliveries')
export class FailedDeliveriesController {
  constructor(
    private readonly failedDeliveriesService: FailedDeliveriesService,
  ) {}

  @Get('list')
  @Roles('superAdmin', 'logístico') // Permisos basados en tu menuConfig
  async getFailedOrders() {
    return this.failedDeliveriesService.getFailedOrders();
  }

  @Patch('mark-extracted')
  @Roles('superAdmin', 'logístico')
  async markAsExtracted(@Body() body: MarkExtractedDto) {
    return this.failedDeliveriesService.markAsExtracted(body.codigos);
  }
}
