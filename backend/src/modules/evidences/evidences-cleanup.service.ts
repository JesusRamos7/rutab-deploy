// /backend/src/modules/evidences/evidences-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class EvidencesCleanupService {
  private readonly logger = new Logger(EvidencesCleanupService.name);
  private supabase;

  constructor(private prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  /**
   * Tarea programada: Se ejecuta todos los domingos a las 3:00 AM.
   * Borra archivos físicos de evidencias aprobadas con más de 90 días.
   
   * Tarea programada:
   * '0'   -> Segundo 0
   * '3'   -> Minuto 3
   * '0'   -> Hora 3 (AM)
   * '*'   -> Cualquier día del mes
   * '*'   -> Cualquier mes
   * '0'   -> Domingo (0)
   */
  //@Cron('0 0 3 * * 0') - Todos los domingos a las 3 AM - Esta linea es para produccion
  @Cron('0 18 * * *')  // Ejecuta todos los días a las 6:00 PM - Esta linea es para pruebas
  async handleCleanup() {
    this.logger.log('Iniciando proceso de limpieza de evidencias antiguas...');

    // 1. Calcular fecha límite (90 días atrás)
    const limiteDias = 90;
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - limiteDias);

    try {
      // 2. Buscar registros que tengan archivos y hayan pasado el tiempo límite
      const evidenciasParaLimpiar = await this.prisma.evidencias.findMany({
        where: {
          estado_evidencia: { in: ['aprobada', 'auto aprobada'] },
          fecha_hora: { lt: fechaLimite },
          OR: [{ foto_url: { not: null } }, { firma_url: { not: null } }],
        },
        select: {
          id: true,
          foto_url: true,
          firma_url: true,
        },
      });

      if (evidenciasParaLimpiar.length === 0) {
        this.logger.log('No se encontraron evidencias para limpiar.');
        return;
      }

      // 3. Extraer todos los paths para borrar en Supabase
      const pathsParaBorrar = evidenciasParaLimpiar.flatMap((e) =>
        [e.foto_url, e.firma_url].filter(Boolean),
      );

      // 4. Borrar archivos físicos en Supabase Storage
      const { error: storageError } = await this.supabase.storage
        .from('evidencias')
        .remove(pathsParaBorrar);

      if (storageError) {
        this.logger.error(
          `Error borrando archivos en Storage: ${storageError.message}`,
        );
        return;
      }

      // 5. Actualizar registros en DB (poner URLs en NULL)
      const ids = evidenciasParaLimpiar.map((e) => e.id);
      await this.prisma.evidencias.updateMany({
        where: { id: { in: ids } },
        data: {
          foto_url: null,
          firma_url: null,
        },
      });

      this.logger.log(
        `Limpieza completada. Se liberó espacio de ${evidenciasParaLimpiar.length} registros.`,
      );
    } catch (error) {
      this.logger.error(
        'Error crítico durante el Cron Job de limpieza:',
        error,
      );
    }
  }
}
