import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomLoggerTypeOrmService } from '../custom-logger/services/custom-logger-typeorm.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService, CustomLoggerTypeOrmService],
      useFactory: async (
        configService: ConfigService,
        loggerTypeOrmService: CustomLoggerTypeOrmService,
      ) =>
        // TODO: Use ConfigServices enum or something else instead of 'database' string. Change in all places for configurations!
        {
          const db = configService.getOrThrow<TypeOrmModuleOptions>('database');

          return {
            ...db,
            logger: loggerTypeOrmService,
          } as TypeOrmModuleOptions;
        },
    }),
  ],
})
export class DatabaseModule {}
