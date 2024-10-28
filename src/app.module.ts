import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { AuthModule } from './modules/auth/auth.module';
import { ValidationConfig } from './modules/configuration/configs/validation.config';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { CoreModule } from './modules/core/core.module';
import { CustomLoggerModule } from './modules/custom-logger/custom-logger.module';
import { DatabaseModule } from './modules/database/database.module';
import { PermissionModule } from './modules/permission/permission.module';
import { ThrottlerCustomModule } from './modules/throttler-custom/throttler-custom.module';
import { ExceptionsLoggerFilter } from './shared/filters/exceptions-logger.filter';

@Module({
  imports: [
    ConfigurationModule,
    ThrottlerCustomModule,
    PermissionModule,
    CustomLoggerModule,
    AuthModule,
    DatabaseModule,

    CoreModule,
  ],
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
