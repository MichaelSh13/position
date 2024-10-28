import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerCustomTypeOrmService } from '../logger-custom/services/logger-custom-typeorm.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService, LoggerCustomTypeOrmService],
      useFactory: async (
        configService: ConfigService,
        loggerTypeOrmService: LoggerCustomTypeOrmService,
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
