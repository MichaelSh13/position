import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsUUID, ValidateNested } from 'class-validator';

import { EmployerUserStatus } from '../consts/employer-user-status.const';

export class EmployerUpdatedUserStatusEventPayload {
  @IsUUID()
  accountId: string;

  @IsEnum(EmployerUserStatus)
  userStatus: EmployerUserStatus;

  @IsBoolean()
  isEmployerActive: boolean;

  @IsBoolean()
  wasEmployerActivityChanged: boolean;
}

export class EmployerUpdatedUserStatusEvent {
  @IsUUID()
  employerId: string;

  @ValidateNested()
  @Type(() => EmployerUpdatedUserStatusEventPayload)
  payload: EmployerUpdatedUserStatusEventPayload;
}
