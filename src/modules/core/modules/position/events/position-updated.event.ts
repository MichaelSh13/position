import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import { PositionEntity } from '../entities/position.entity';

export class PositionUpdatedEventPayload {
  @ValidateNested()
  @Type(() => PositionEntity)
  position: PositionEntity;
}

export class PositionUpdatedEvent {
  @IsUUID()
  positionId: string;

  @ValidateNested()
  @Type(() => PositionUpdatedEventPayload)
  payload: PositionUpdatedEventPayload;
}
