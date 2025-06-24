import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsUUID, ValidateNested } from 'class-validator';

import { PositionUserStatus } from '../consts/position-user-status.const';

export class PositionUpdatedUserStatusEventPayload {
  @IsUUID()
  employerId: string;

  @IsEnum(PositionUserStatus)
  userStatus: PositionUserStatus;

  @IsBoolean()
  isPositionActive: boolean;

  @IsBoolean()
  wasPositionActivityChanged: boolean;
}

export class PositionUpdatedUserStatusEvent {
  @IsUUID()
  positionId: string;

  @ValidateNested()
  @Type(() => PositionUpdatedUserStatusEventPayload)
  payload: PositionUpdatedUserStatusEventPayload;
}
