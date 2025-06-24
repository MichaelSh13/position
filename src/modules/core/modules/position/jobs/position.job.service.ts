import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitterService } from 'src/modules/event-emitter-custom/services/event-emitter-custom.service';
import { Repository } from 'typeorm';

import { PositionEntity } from '../entities/position.entity';

@Injectable()
export class PositionJobService {
  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,

    private readonly eventEmitterService: EventEmitterService,
  ) {}

  // TODO: Deactivate positions by some rules.
}
