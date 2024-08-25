import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';

import { RequestLoggerMiddleware } from './middlewares/logger.middleware';
import { CustomLoggerService } from './services/custom-logger.service';
import { CustomLoggerTypeOrmService } from './services/custom-logger-typeorm.service';

@Global()
@Module({
  providers: [CustomLoggerService, CustomLoggerTypeOrmService],
  exports: [CustomLoggerService, CustomLoggerTypeOrmService],
})
export class CustomLoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
