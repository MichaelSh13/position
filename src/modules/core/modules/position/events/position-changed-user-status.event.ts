import { Type } from 'class-transformer';
import { IsEnum, IsUUID, ValidateNested } from 'class-validator';

import { PositionUserStatus } from '../consts/position-user-status.const';

export class PositionChangedUserStatusEventPayload {
  @IsEnum(PositionUserStatus)
  userStatus: PositionUserStatus;
}

export class PositionChangedUserStatusEvent {
  @IsUUID()
  positionId: string;

  @ValidateNested()
  @Type(() => PositionChangedUserStatusEventPayload)
  payload: PositionChangedUserStatusEventPayload;
}
