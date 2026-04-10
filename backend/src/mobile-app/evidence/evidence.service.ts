// /backend/src/mobile-app/evidence/evidence.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';
import { CreateEvidenceDto } from './dto/create-evidence.dto';

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

    try {
      // 1. Procesar Fotografía (Ya viene como Buffer desde el Controller)
      const fotoFileName = `foto_${pedidoId}_${Date.now()}.jpg`;
      const fotoPath = await this.uploadBufferToSupabase(
        photoFile.buffer,
        `pedidos/fotos/${fotoFileName}`,
        photoFile.mimetype,
      );

      // 2. Procesar Firma (Base64 -> Buffer)
      // Removemos el prefijo "data:image/png;base64," para obtener solo los datos binarios
      const base64Data = firmaBase64.replace(/^data:image\/\w+;base64,/, '');
      const firmaBuffer = Buffer.from(base64Data, 'base64');

      const firmaFileName = `firma_${pedidoId}_${Date.now()}.png`;
      const firmaPath = await this.uploadBufferToSupabase(
        firmaBuffer,
        `pedidos/firmas/${firmaFileName}`,
        'image/png',
      );

      // 3. Persistencia en Base de Datos (Transacción Atómica)
      return await this.prisma.$transaction(async (tx) => {
        // Insertamos los PATHS devueltos por Supabase
        await tx.$executeRaw`
          INSERT INTO evidencias (
            pedido_id, 
            foto_url, 
            firma_url, 
            coordenadas_entrega
          ) VALUES (
            ${pedidoId}::uuid, 
            ${fotoPath}, 
            ${firmaPath}, 
            ST_GeomFromText(${`POINT(${longitude} ${latitude})`}, 4326)
          )
        `;

        // Actualizamos el estado del pedido a entregado
        await tx.pedidos.update({
          where: { id: pedidoId },
          data: { estado_pedido: 'entregado' },
        });

        return {
          success: true,
          message: 'Evidencia guardada y pedido finalizado con éxito',
        };
      });
    } catch (error) {
      console.error('Error crítico en saveEvidence:', error);
      throw new InternalServerErrorException(
        'No se pudo procesar la entrega. Intenta de nuevo.',
      );
    }
  }
}
