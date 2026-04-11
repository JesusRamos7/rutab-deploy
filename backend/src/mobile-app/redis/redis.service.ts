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

    await this.redis.lpush(key, payload);
    await this.redis.expire(key, 86400);
  }

  async getRoutePoints(rutaId: string) {
    const key = `ruta:${rutaId}:puntos`;
    return await this.redis.lrange(key, 0, -1);
  }

  /**
   * NUEVO: Registra el momento exacto en que se inicia la ruta.
   */
  async setStartTime(rutaId: string) {
    const key = `ruta:${rutaId}:start_time`;
    await this.redis.set(key, new Date().toISOString());
    await this.redis.expire(key, 86400); // 24 horas de expiración
  }

  /**
   * NUEVO: Recupera el timestamp de inicio guardado.
   */
  async getStartTime(rutaId: string): Promise<string | null> {
    const key = `ruta:${rutaId}:start_time`;
    return await this.redis.get(key);
  }

  /**
   * ACTUALIZADO: Limpia tanto los puntos como el tiempo de inicio.
   */
  async clearRouteData(rutaId: string) {
    const pointsKey = `ruta:${rutaId}:puntos`;
    const timeKey = `ruta:${rutaId}:start_time`;
    await this.redis.del(pointsKey, timeKey);
  }
}
