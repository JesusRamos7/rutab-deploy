// src/database/prisma/prisma.module.ts

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Módulo de persistencia global.
 * Centraliza la conexión con la base de datos mediante Prisma ORM.
 */
@Global() // Define el módulo como global para evitar importaciones redundantes en otros módulos de la app.
@Module({
  /**
   * Registro del PrismaService como proveedor para habilitar la inyección de dependencias.
   */
  providers: [PrismaService],
  /**
   * Exportación del servicio para permitir que otros componentes (servicios, controladores)
   * interactúen con la capa de datos.
   */
  exports: [PrismaService],
})
export class PrismaModule {}
