import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Hace que el servicio esté disponible en toda la app
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Lo exportamos para que otros módulos lo usen
})
export class PrismaModule {}