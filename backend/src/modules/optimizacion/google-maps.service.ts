// /backend/src/modules/optimizacion/google-maps.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { PuntoPedido, DetalleRutaOrdenado } from './dto/optimizacion.dto';

@Injectable()
export class GoogleMapsService {
  private readonly apiKey = process.env.GOOGLE_MAPS_API_KEY;
  private readonly baseEmpresa = {
    lat: parseFloat(process.env.ORIGEN_LAT || '0'),
    lng: parseFloat(process.env.ORIGEN_LNG || '0'),
  };

  /**
   * Obtiene el orden óptimo de un grupo de pedidos.
   * @param pedidos Lista de pedidos a entregar.
   * @param puntoInicio Coordenadas de salida (opcional, por defecto la base).
   * @param puntoFin Coordenadas de llegada (opcional, por defecto la base).
   */
  async obtenerOrdenOptimo(
    pedidos: PuntoPedido[],
    puntoInicio?: { lat: number; lng: number },
    puntoFin?: { lat: number; lng: number },
  ): Promise<DetalleRutaOrdenado> {
    if (pedidos.length === 0)
      return { pedidos: [], distanciaMetros: 0, duracionSegundos: 0 };

    // Definimos origen y destino dinámicos
    const origen = puntoInicio
      ? `${puntoInicio.lat},${puntoInicio.lng}`
      : `${this.baseEmpresa.lat},${this.baseEmpresa.lng}`;

    const destino = puntoFin
      ? `${puntoFin.lat},${puntoFin.lng}`
      : `${this.baseEmpresa.lat},${this.baseEmpresa.lng}`;

    const waypoints = pedidos.map((p) => `${p.lat},${p.lng}`).join('|');

    try {
      const { data } = await axios.get(
        'https://maps.googleapis.com/maps/api/directions/json',
        {
          params: {
            origin: origen,
            destination: destino,
            waypoints: `optimize:true|${waypoints}`,
            key: this.apiKey,
          },
        },
      );

      if (data.status !== 'OK')
        throw new Error(`Google API Error: ${data.status}`);

      const route = data.routes[0];
      const ordenIndices = route.waypoint_order;

      const distanciaTotal = route.legs.reduce(
        (acc, leg) => acc + leg.distance.value,
        0,
      );
      const duracionTotal = route.legs.reduce(
        (acc, leg) => acc + leg.duration.value,
        0,
      );

      return {
        // Mapeamos los pedidos según el orden de waypoints devuelto por Google
        pedidos: ordenIndices.map((index) => pedidos[index]),
        distanciaMetros: distanciaTotal,
        duracionSegundos: duracionTotal,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al consultar Google Directions',
      );
    }
  }
}
