// /backend/src/modules/optimizacion/optimizacion.controller.ts

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Get,
  Query,
} from '@nestjs/common';
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
   * Ahora acepta coordenadas opcionales de inicio y fin para permitir el encadenamiento.
   */
  @Post('ordenar-cluster')
  @Roles('superAdmin', 'logístico')
  async ordenarCluster(
    @Body()
    body: {
      pedidos: PuntoPedido[];
      inicio?: { lat: number; lng: number };
      fin?: { lat: number; lng: number };
    },
  ) {
    // Usamos el nuevo método del servicio que soporta origen/destino dinámicos
    return await this.optimizacionService.optimizarPuntos(
      body.pedidos,
      body.inicio,
      body.fin,
    );
  }

  /**
   * PASO 3 (OPTIMIZADO): Orden de visita entre grupos.
   * Ya no consume Google Maps API. Utiliza matemáticas locales (Vecino más cercano).
   */
  @Post('proponer-orden-clusters')
  @Roles('superAdmin', 'logístico')
  async proponerOrdenClusters(@Body() dto: OrdenClustersRequest) {
    // Llamada al método local que creamos en el OptimizacionService
    return this.optimizacionService.ordenarClustersLocalmente(dto.centroides);
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
   * Tabla inicial de rutas en estado borrador.
   */
  @Get('rutas-pendientes')
  @Roles('superAdmin', 'logístico')
  async obtenerRutasPendientes(
    @Query('busqueda') busqueda?: string,
    @Query('fecha') fecha?: string,
  ) {
    // Pasamos los parámetros opcionales directamente al servicio
    return await this.optimizacionService.obtenerRutasPendientes(
      busqueda,
      fecha,
    );
  }
}
