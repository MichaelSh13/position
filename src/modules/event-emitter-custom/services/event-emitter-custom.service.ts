import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventEmitterService {
  // private readonly logger = new Logger(EventEmitterService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit(event: string, ...payload: any[]) {
    // TODO: Add logger.
    // this.logger.log(`Event emitted: ${event}`);
    return this.eventEmitter.emit(event, ...payload);
  }

  async emitAsync(event: string, ...payload: any[]) {
    // TODO: Add logger.
    // this.logger.log(`Event emitted: ${event}`);
    return this.eventEmitter.emitAsync(event, ...payload);
  }
}
