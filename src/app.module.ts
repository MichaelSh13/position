import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { CacheCustomModule } from './modules/cache-custom/cache-custom.module';
import { ValidationConfig } from './modules/configuration/configs/validation.config';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { CoreModule } from './modules/core/core.module';
import { CronJobModule } from './modules/cron-job/cron-job.module';
import { DatabaseModule } from './modules/database/database.module';
import { EventEmitterCustomModule } from './modules/event-emitter-custom/event-emitter-custom.module';
import { LoggerCustomModule } from './modules/logger-custom/logger-custom.module';
import { PermissionModule } from './modules/permission/permission.module';
import { ThrottlerCustomModule } from './modules/throttler-custom/throttler-custom.module';
import { ExceptionsLoggerFilter } from './shared/filters/exceptions-logger.filter';

@Module({
  imports: [
    ConfigurationModule,
    ThrottlerCustomModule,
    PermissionModule,
    LoggerCustomModule,
    AuthModule,
    DatabaseModule,
    EventEmitterCustomModule,
    CacheCustomModule,
    CronJobModule,

    CoreModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { pipeOptions, validationOptions } =
          configService.getOrThrow<ValidationConfig>('validation');

        return new ValidationPipe({ ...pipeOptions, ...validationOptions });
      },
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionsLoggerFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
