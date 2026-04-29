import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service'; // Ajusta la ruta a tu PrismaService
import { GetIncidentsDto } from './dto/get-incidents.dto';
import { Prisma } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class IncidentsService {
  private supabase: SupabaseClient;

  constructor(private readonly prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  async findAll(filters: GetIncidentsDto) {
    try {
      const conditions: Prisma.Sql[] = [];

      if (filters.estado) {
        conditions.push(Prisma.sql`i.estado_incidencia = ${filters.estado}`);
      }
      if (filters.categoria) {
        conditions.push(Prisma.sql`i.categoria = ${filters.categoria}`);
      }
      if (filters.fecha) {
        conditions.push(
          Prisma.sql`DATE(i.created_at) = DATE(${filters.fecha})`,
        );
      }
      if (filters.choferCorreo) {
        conditions.push(
          Prisma.sql`c.correo ILIKE ${'%' + filters.choferCorreo + '%'}`,
        );
      }

      const whereClause =
        conditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
          : Prisma.empty;

      const query = Prisma.sql`
        SELECT 
          i.id, 
          i.tipo, 
          i.descripcion, 
          i.foto_url as "fotoUrl", 
          i.estado_incidencia as "estado", 
          i.categoria, 
          i.created_at as "createdAt",
          ST_X(i.coordenadas_incidente::geometry) as lng,
          ST_Y(i.coordenadas_incidente::geometry) as lat,
          c.id as "choferId", 
          c.nombre as "choferNombre", 
          c.correo as "choferCorreo"
        FROM incidencias i
        LEFT JOIN rutas r ON i.ruta_id = r.id
        LEFT JOIN choferes c ON r.chofer_id = c.id
        ${whereClause}
        ORDER BY i.created_at DESC
      `;

      const incidents: any[] = await this.prisma.$queryRaw(query);

      // Firmar URLs de Supabase
      const result = await Promise.all(
        incidents.map(async (inc) => {
          let signedUrl = null;

          if (inc.fotoUrl) {
            // Pasamos la ruta exacta (ej. "incidentes/incidente_1777453002719.jpg")
            const { data, error } = await this.supabase.storage
              .from('evidencias') // Tu bucket
              .createSignedUrl(inc.fotoUrl, 3600);

            if (error) {
              console.error(
                `Error al firmar foto ${inc.fotoUrl}:`,
                error.message,
              );
            }

            signedUrl = data?.signedUrl || null;
          }

          return {
            ...inc,
            // Forzamos a que siempre sean números de punto flotante
            lat: inc.lat ? parseFloat(inc.lat) : null,
            lng: inc.lng ? parseFloat(inc.lng) : null,
            fotoUrlFirmada: signedUrl,
          };
        }),
      );

      return result;
    } catch (error) {
      console.error('Error al obtener incidencias:', error);
      throw new InternalServerErrorException(
        'Error al recuperar las incidencias',
      );
    }
  }

  async updateStatus(id: string, estado: string) {
    try {
      // Usamos update estándar de Prisma para mayor seguridad y limpieza en campos de texto
      const updated = await this.prisma.incidencias.update({
        where: { id },
        data: { estado_incidencia: estado },
      });
      return updated;
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      throw new InternalServerErrorException(
        'No se pudo actualizar la incidencia',
      );
    }
  }
}
