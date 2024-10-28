import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

import { RedisDto } from '../configuration/dto/redis.dto';

@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { host, port, ttl } = configService.getOrThrow<RedisDto>('redis');

        const store = await redisStore({
          url: `redis://${host}:${port}`,
          ttl,
        });

        return {
          store,
        };
      },
    }),
  ],
})
export class CacheCustomModule {}
