// /backend/src/modules/optimization/google-maps.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { PuntoPedido, DetalleRutaOrdenado } from './dto/optimization.dto';

/**
 * Servicio encargado de la integración con la API de Google Maps para el
 * cálculo de rutas y ordenamiento logístico eficiente.
 */
@Injectable()
export class GoogleMapsService {
  private readonly apiKey = process.env.GOOGLE_MAPS_API_KEY;

  /** Coordenadas del centro logístico principal obtenidas desde variables de entorno */
  private readonly baseEmpresa = {
    lat: parseFloat(process.env.ORIGEN_LAT || '0'),
    lng: parseFloat(process.env.ORIGEN_LNG || '0'),
  };

  /**
   * Utiliza el motor de Google Directions para resolver el orden de entrega más eficiente
   * (Problema del Viajante) entre un conjunto de puntos.
   * * @param pedidos Listado de puntos de entrega a procesar.
   * @param puntoInicio Punto de partida personalizado (opcional).
   * @param puntoFin Punto de llegada personalizado (opcional).
   */
  async obtenerOrdenOptimo(
    pedidos: PuntoPedido[],
    puntoInicio?: { lat: number; lng: number },
    puntoFin?: { lat: number; lng: number },
  ): Promise<DetalleRutaOrdenado> {
    if (pedidos.length === 0)
      return { pedidos: [], distanciaMetros: 0, duracionSegundos: 0 };

    /** Determina si se inicia y finaliza en la base o en puntos específicos */
    const origen = puntoInicio
      ? `${puntoInicio.lat},${puntoInicio.lng}`
      : `${this.baseEmpresa.lat},${this.baseEmpresa.lng}`;

    const destino = puntoFin
      ? `${puntoFin.lat},${puntoFin.lng}`
      : `${this.baseEmpresa.lat},${this.baseEmpresa.lng}`;

    /** Formatea los pedidos como waypoints para la API de Google */
    const waypoints = pedidos.map((p) => `${p.lat},${p.lng}`).join('|');

    try {
      const { data } = await axios.get(
        'https://maps.googleapis.com/maps/api/directions/json',
        {
          params: {
            origin: origen,
            destination: destino,
            /** optimize:true activa el algoritmo de optimización de ruta de Google */
            waypoints: `optimize:true|${waypoints}`,
            key: this.apiKey,
          },
        },
      );

      if (data.status !== 'OK')
        throw new Error(`Google API Error: ${data.status}`);

      const route = data.routes[0];
      const ordenIndices = route.waypoint_order;

      /** Suma la métrica de cada tramo (leg) para obtener el total del recorrido */
      const distanciaTotal = route.legs.reduce(
        (acc, leg) => acc + leg.distance.value,
        0,
      );
      const duracionTotal = route.legs.reduce(
        (acc, leg) => acc + leg.duration.value,
        0,
      );

      return {
        /** Reordena el array original de pedidos basándose en la secuencia óptima devuelta */
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