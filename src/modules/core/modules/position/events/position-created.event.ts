import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import { PositionEntity } from '../entities/position.entity';

export class PositionCreatedEventPayload {
  @ValidateNested()
  @Type(() => PositionEntity)
  position: PositionEntity;
}

export class PositionCreatedEvent {
  @IsUUID()
  positionId: string;

  @ValidateNested()
  @Type(() => PositionCreatedEventPayload)
  payload: PositionCreatedEventPayload;
}
