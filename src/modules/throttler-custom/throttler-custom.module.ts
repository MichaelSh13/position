import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { ThrottlerCustomGuard } from './guards/throttler-custom.guard';

@Module({
  imports: [ThrottlerModule.forRoot()],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerCustomGuard,
    },
  ],
})
export class ThrottlerCustomModule {}
