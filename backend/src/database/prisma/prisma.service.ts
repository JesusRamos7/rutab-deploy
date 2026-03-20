// src/database/prisma/prisma.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Proveedor de servicios para interactuar con la base de datos.
 * Hereda todas las capacidades de consulta de PrismaClient para su uso mediante inyección de dependencias.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * Hook de ciclo de vida de NestJS.
   * Ejecuta la conexión explícita al motor de base de datos inmediatamente después de
   * que el módulo ha sido inicializado.
   */
  async onModuleInit() {
    await this.$connect();
  }
}
