// test/db-connection.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
// Subimos un nivel (../) para entrar a 'src' y buscar los archivos
import { PrismaService } from '../src/database/prisma/prisma.service';
import { PrismaModule } from '../src/database/prisma/prisma.module';

/**
 * Test de Integración: Verificación de conectividad con la base de datos.
 * Este archivo se encuentra fuera de 'src', por lo que apunta directamente
 * a los módulos de infraestructura para validar el entorno real.
 */
describe('Database Connection (Integration)', () => {
  let prisma: PrismaService;
  let moduleFixture: TestingModule;

  // Inicialización del módulo de testing de NestJS
  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  // Cierre de conexiones para evitar fugas de memoria o procesos colgados
  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
    await moduleFixture.close();
  });

  it('debe establecer conexión con la BD y responder a un SELECT simple', async () => {
    /**
     * Ejecuta una consulta nativa (Raw Query).
     * Si el DATABASE_URL es incorrecto, este método lanzará una excepción.
     */
    const result = await prisma.$queryRaw`SELECT 1 as check`;

    expect(result).toBeDefined();
    expect(result[0].check).toBe(1);
  });

  it('debe reconocer el modelo de "vehiculos" (Validación de Schema)', async () => {
    /**
     * Verifica que el cliente de Prisma generado coincida con las tablas
     * existentes en la base de datos vinculada.
     */
    const count = await prisma.vehiculos.count();
    expect(typeof count).toBe('number');
  });
});
