// /backend/src/mobile-app/redis/redis.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private redis: Redis;

  onModuleInit() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  async pushLocation(rutaId: string, data: any) {
    const key = `ruta:${rutaId}:puntos`;
    const payload = JSON.stringify({
      lat: data.latitude,
      lng: data.longitude,
      v: data.velocidad || 0,
      t: new Date().toISOString(),
    });

    // Guardamos en la lista (LPUSH) y definimos expiración de 24h
    await this.redis.lpush(key, payload);
    await this.redis.expire(key, 86400);
  }

  /**
   * NUEVO: Recupera todos los puntos guardados para una ruta específica.
   * Usamos LRANGE para obtener la lista completa desde el primer (0) al último (-1) elemento.
   */
  async getRoutePoints(rutaId: string) {
    const key = `ruta:${rutaId}:puntos`;
    return await this.redis.lrange(key, 0, -1);
  }

  /**
   * NUEVO: Elimina los datos de la ruta en Redis una vez procesados.
   * Esto mantiene tu Upstash limpio y evita cargos innecesarios por almacenamiento.
   */
  async clearRouteData(rutaId: string) {
    const key = `ruta:${rutaId}:puntos`;
    await this.redis.del(key);
  }
}
