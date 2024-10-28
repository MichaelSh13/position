import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import { PositionEntity } from '../entities/position.entity';

export class PositionChangedRoleEventPayload {
  @ValidateNested()
  @Type(() => PositionEntity)
  position: PositionEntity;
}

export class PositionChangedRoleEvent implements BaseEvent {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => PositionChangedRoleEventPayload)
  payload: PositionChangedRoleEventPayload;
}
