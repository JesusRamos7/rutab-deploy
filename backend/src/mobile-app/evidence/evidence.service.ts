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

  private async uploadToSupabase(file: Express.Multer.File, path: string) {
    const { data, error } = await this.supabase.storage
      .from('evidencias')
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new InternalServerErrorException(
        'Error al subir archivo a Supabase',
      );
    }
    return data.path;
  }

  async saveEvidence(dto: CreateEvidenceDto, photoFile: Express.Multer.File) {
    const { pedidoId, firmaBase64, latitude, longitude } = dto;

    // 1. Subir fotografía
    const fileName = `foto_${pedidoId}_${Date.now()}.jpg`;
    const fotoPath = await this.uploadToSupabase(
      photoFile,
      `pedidos/${fileName}`,
    );

    // 2. Transacción: Guardar evidencia y actualizar pedido
    return this.prisma.$transaction(async (tx) => {
      // Inserción de geografía mediante SQL Raw
      await tx.$executeRaw`
        INSERT INTO evidencias (
          pedido_id, 
          foto_url, 
          firma_url, 
          coordenadas_entrega
        ) VALUES (
          ${pedidoId}::uuid, 
          ${fotoPath}, 
          ${firmaBase64}, 
          ST_GeomFromText(${`POINT(${longitude} ${latitude})`}, 4326)
        )
      `;

      // Actualizar estado del pedido
      await tx.pedidos.update({
        where: { id: pedidoId },
        data: { estado_pedido: 'entregado' },
      });

      return { success: true, message: 'Entrega registrada correctamente' };
    });
  }
}
