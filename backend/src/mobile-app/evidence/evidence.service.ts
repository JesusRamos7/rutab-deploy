// /backend/src/mobile-app/evidence/evidence.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class EvidenceService {
  private supabase;

  constructor(private prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  /**
   * Helper genérico para subir un Buffer al Storage de Supabase
   */
  private async uploadBufferToSupabase(
    buffer: Buffer,
    path: string,
    mimetype: string,
  ) {
    const { data, error } = await this.supabase.storage
      .from('evidencias')
      .upload(path, buffer, {
        contentType: mimetype,
        upsert: true, // Si el archivo ya existe, lo sobrescribe
      });

    if (error) {
      throw new InternalServerErrorException(
        `Error Supabase: ${error.message}`,
      );
    }
    return data.path;
  }

  async saveEvidence(dto: CreateEvidenceDto, photoFile: Express.Multer.File) {
    const { pedidoId, firmaBase64, latitude, longitude } = dto;
    const UMBRAL_METROS = 100; // Distancia máxima para auto-aprobación

    try {
      // 1. Procesar Fotografía
      const fotoFileName = `foto_${pedidoId}_${Date.now()}.jpg`;
      const fotoPath = await this.uploadBufferToSupabase(
        photoFile.buffer,
        `pedidos/fotos/${fotoFileName}`,
        photoFile.mimetype,
      );

      // 2. Procesar Firma
      const base64Data = firmaBase64.replace(/^data:image\/\w+;base64,/, '');
      const firmaBuffer = Buffer.from(base64Data, 'base64');
      const firmaFileName = `firma_${pedidoId}_${Date.now()}.png`;
      const firmaPath = await this.uploadBufferToSupabase(
        firmaBuffer,
        `pedidos/firmas/${firmaFileName}`,
        'image/png',
      );

      // 3. Persistencia con cálculo de distancia
      return await this.prisma.$transaction(async (tx) => {
        /**
         * Usamos una consulta que busca la coordenada del cliente a través del pedido
         * y calcula la distancia vs el punto enviado por el chofer.
         */
        await tx.$executeRaw`
        WITH info_cliente AS (
          奠 SELECT c.coordenadas 
          FROM pedidos p
          JOIN clientes c ON p.cliente_id = c.id
          WHERE p.id = ${pedidoId}::uuid
          LIMIT 1
        )
        INSERT INTO evidencias (
          pedido_id, 
          foto_url, 
          firma_url, 
          coordenadas_entrega,
          estado_evidencia
        ) 
        SELECT 
          ${pedidoId}::uuid, 
          ${fotoPath}, 
          ${firmaPath}, 
          ST_SetSRID(ST_MakePoint(${+longitude}, ${+latitude}), 4326)::geography,
          CASE 
            WHEN ST_Distance(
              ST_SetSRID(ST_MakePoint(${+longitude}, ${+latitude}), 4326)::geography, 
              (SELECT coordenadas FROM info_cliente)
            ) <= ${UMBRAL_METROS} THEN 'auto aprobada'
            ELSE 'alerta'
          END
        FROM info_cliente;
      `;

        // Actualizamos el estado del pedido
        await tx.pedidos.update({
          where: { id: pedidoId },
          data: { estado_pedido: 'entregado' },
        });

        return {
          success: true,
          message: 'Evidencia procesada correctamente',
        };
      });
    } catch (error) {
      console.error('Error crítico en saveEvidence:', error);
      throw new InternalServerErrorException('No se pudo procesar la entrega.');
    }
  }

  async saveIncident(dto: CreateIncidentDto) {
    const { pedidoId, rutaId, tipo, descripcion, latitude, longitude } = dto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Insertar la incidencia con su ubicación real
        // Nota: Usamos ST_GeomFromText para crear el punto geográfico
        await tx.$executeRaw`
        INSERT INTO incidencias (
          ruta_id, 
          pedido_id, 
          tipo, 
          descripcion, 
          coordenadas_incidente,
          created_at,
          updated_at
        ) VALUES (
          ${rutaId}::uuid, 
          ${pedidoId}::uuid, 
          ${tipo}, 
          ${descripcion}, 
          ST_GeomFromText(${`POINT(${longitude} ${latitude})`}, 4326),
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `;

        // 2. Marcar el pedido como 'fallido'
        await tx.pedidos.update({
          where: { id: pedidoId },
          data: {
            estado_pedido: 'fallido',
            updated_at: new Date(),
          },
        });

        return {
          success: true,
          message: 'Incidente registrado y ubicación guardada.',
        };
      });
    } catch (error) {
      console.error('Error crítico en saveIncident:', error);
      throw new InternalServerErrorException(
        'No se pudo registrar el incidente en el servidor.',
      );
    }
  }
}
