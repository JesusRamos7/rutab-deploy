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
}
