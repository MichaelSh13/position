import { Type } from 'class-transformer';
import { IsEnum, IsUUID, ValidateNested } from 'class-validator';

import { PositionSystemStatus } from '../consts/position-system-status.const';

export class PositionChangedSystemStatusEventPayload {
  @IsEnum(PositionSystemStatus)
  systemStatus: PositionSystemStatus;
}

export class PositionChangedSystemStatusEvent {
  @IsUUID()
  positionId: string;

  @ValidateNested()
  @Type(() => PositionChangedSystemStatusEventPayload)
  payload: PositionChangedSystemStatusEventPayload;
}
