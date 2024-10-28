import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';

import { RequestLoggerMiddleware } from './middlewares/logger.middleware';
import { LoggerCustomService } from './services/logger-custom.service';
import { LoggerCustomTypeOrmService } from './services/logger-custom-typeorm.service';

@Global()
@Module({
  providers: [LoggerCustomService, LoggerCustomTypeOrmService],
  exports: [LoggerCustomService, LoggerCustomTypeOrmService],
})
export class LoggerCustomModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
