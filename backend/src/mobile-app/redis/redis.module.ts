// /backend/src/mobile-app/redis/redis.module.ts
import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global() // Lo hacemos global para que sea fácil de usar en otros módulos
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
