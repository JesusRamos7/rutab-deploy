// /backend/src/modules/evidences/evidences.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { EvidenceQueryDto } from './dto/evidence-query.dto';

@Injectable()
export class EvidencesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: EvidenceQueryDto) {
    const { estado, pedidoId, choferNombre } = query;

    // Usamos queryRaw porque necesitamos cálculos geográficos de PostGIS
    // y joins que cruzan varias tablas hasta llegar al chofer.
    return this.prisma.$queryRaw`
      SELECT 
        e.id,
        e.pedido_id as "pedidoId",
        e.foto_url as "fotoUrl",
        e.firma_url as "firmaUrl",
        e.estado_evidencia as "estado",
        e.fecha_hora as "fechaHora",
        p.codigo_rastreo as "codigoRastreo",
        c.nombre as "clienteNombre",
        ch.id as "choferId",
        ch.nombre as "choferNombre",
        ch.correo as "choferCorreo",
        ST_Distance(e.coordenadas_entrega, c.coordenadas) as "distanciaMetros"
      FROM evidencias e
      JOIN pedidos p ON e.pedido_id = p.id
      JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN detalles_ruta dr ON p.id = dr.pedido_id
      LEFT JOIN rutas r ON dr.ruta_id = r.id
      LEFT JOIN choferes ch ON r.chofer_id = ch.id
      WHERE 
        (${estado}::text IS NULL OR e.estado_evidencia = ${estado})
        AND (${pedidoId}::text IS NULL OR e.pedido_id::text = ${pedidoId})
        AND (${choferNombre}::text IS NULL OR ch.nombre ILIKE ${'%' + choferNombre + '%'})
      ORDER BY e.fecha_hora DESC
    `;
  }

  async approve(id: string) {
    const evidencia = await this.prisma.evidencias.findUnique({
      where: { id },
    });
    if (!evidencia) throw new NotFoundException('Evidencia no encontrada');

    return this.prisma.evidencias.update({
      where: { id },
      data: { estado_evidencia: 'aprobada' },
    });
  }
}
