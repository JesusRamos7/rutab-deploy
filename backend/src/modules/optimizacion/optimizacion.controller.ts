// /backend/src/modules/optimizacion/optimizacion.controller.ts

import { Controller, Post, Body, UseGuards, Patch, Get } from '@nestjs/common';
import { OptimizacionService } from './optimizacion.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ClusteringRequestDto,
  PuntoPedido,
  OrdenClustersRequest,
  PublicarRutaDto,
} from './dto/optimizacion.dto';

@Controller('optimizacion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OptimizacionController {
  constructor(private readonly optimizacionService: OptimizacionService) {}

  /**
   * PASO 1: Agrupación inicial (K-Means)
   */
  @Post('sugerir-clusters')
  @Roles('superAdmin', 'logístico')
  async sugerirClusters(@Body() dto: ClusteringRequestDto) {
    return await this.optimizacionService.generarSugerenciaClusters(
      dto.vehiculoId,
      dto.fechaProgramada,
    );
  }

  /**
   * PASO 2: Ordenamiento lógico de un grupo (Google Maps)
   * Nota: En un entorno real, este endpoint se conectaría al GoogleMapsService a través del OptimizacionService.
   */
  @Post('ordenar-cluster')
  @Roles('superAdmin', 'logístico')
  async ordenarCluster(@Body() pedidos: PuntoPedido[]) {
    // Implementación del puente hacia GoogleMapsService (omitida en el service simplificado anterior,
    // pero necesaria si el frontend pide orden por cluster).
    return await this.optimizacionService['googleService'].obtenerOrdenOptimo(
      pedidos,
    );
  }

  /**
   * PASO 3: Orden de visita entre grupos (Google Maps)
   * CORRECCIÓN: Ahora extrae solo los IDs para que el frontend pueda iterar.
   */
  @Post('proponer-orden-clusters')
  @Roles('superAdmin', 'logístico')
  async proponerOrdenClusters(@Body() dto: OrdenClustersRequest) {
    const resultado = await this.optimizacionService[
      'googleService'
    ].obtenerOrdenOptimo(
      dto.centroides.map((c) => ({
        id: String(c.clusterId),
        cliente: 'Centroide',
        lat: c.lat,
        lng: c.lng,
      })),
    );

    // Retornamos únicamente el arreglo de IDs (convertidos a número)
    return resultado.pedidos.map((p) => Number(p.id));
  }

  /**
   * PASO 4: Guardar todo en base de datos
   */
  @Patch('publicar')
  @Roles('superAdmin', 'logístico')
  async publicar(@Body() dto: PublicarRutaDto) {
    return await this.optimizacionService.publicarRuta(dto);
  }

  /**
   * Endpoint para cargar la tabla inicial de la vista.
   */
  @Get('rutas-pendientes')
  @Roles('superAdmin', 'logístico')
  async obtenerRutasPendientes() {
    return await this.optimizacionService.obtenerRutasPendientes();
  }
}
