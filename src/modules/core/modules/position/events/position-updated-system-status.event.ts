import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsUUID, ValidateNested } from 'class-validator';

import { PositionSystemStatus } from '../consts/position-system-status.const';

export class PositionChangedSystemStatusEventPayload {
  @IsUUID()
  employerId: string;

  @IsEnum(PositionSystemStatus)
  systemStatus: PositionSystemStatus;

  @IsBoolean()
  isPositionActive: boolean;

  @IsBoolean()
  wasPositionActivityChanged: boolean;
}

export class PositionUpdatedSystemStatusEvent {
  @IsUUID()
  positionId: string;

  @ValidateNested()
  @Type(() => PositionChangedSystemStatusEventPayload)
  payload: PositionChangedSystemStatusEventPayload;
}
