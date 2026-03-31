// /backend/src/modules/optimizacion/google-maps.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { PuntoPedido, DetalleRutaOrdenado } from './dto/optimizacion.dto';

@Injectable()
export class GoogleMapsService {
  private readonly apiKey = process.env.GOOGLE_MAPS_API_KEY;
  private readonly origen = {
    lat: parseFloat(process.env.ORIGEN_LAT || '0'),
    lng: parseFloat(process.env.ORIGEN_LNG || '0'),
  };

  async obtenerOrdenOptimo(
    pedidos: PuntoPedido[],
  ): Promise<DetalleRutaOrdenado> {
    if (pedidos.length === 0)
      return { pedidos: [], distanciaMetros: 0, duracionSegundos: 0 };

    const puntoBase = `${this.origen.lat},${this.origen.lng}`;
    const waypoints = pedidos.map((p) => `${p.lat},${p.lng}`).join('|');

    try {
      const { data } = await axios.get(
        'https://maps.googleapis.com/maps/api/directions/json',
        {
          params: {
            origin: puntoBase,
            destination: puntoBase,
            waypoints: `optimize:true|${waypoints}`,
            key: this.apiKey,
          },
        },
      );

      if (data.status !== 'OK')
        throw new Error(`Google API Error: ${data.status}`);

      const route = data.routes[0];
      const ordenIndices = route.waypoint_order;

      // Calculamos totales sumando cada tramo (leg) de la ruta
      const distanciaTotal = route.legs.reduce(
        (acc, leg) => acc + leg.distance.value,
        0,
      );
      const duracionTotal = route.legs.reduce(
        (acc, leg) => acc + leg.duration.value,
        0,
      );

      return {
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
