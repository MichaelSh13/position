import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { EventEmitterService } from './services/event-emitter-custom.service';

@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [EventEmitterService],
  exports: [EventEmitterService],
})
export class EventEmitterCustomModule {}
