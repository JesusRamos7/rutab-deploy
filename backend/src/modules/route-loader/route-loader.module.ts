import { Module } from '@nestjs/common';
import { RouteLoaderController } from './route-loader.controller';
import { RouteLoaderService } from './route-loader.service';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RouteLoaderController],
  providers: [RouteLoaderService],
})
export class RouteLoaderModule {}
