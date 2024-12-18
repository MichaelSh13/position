import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { AccountUserStatus } from '../consts/account-user-status.const';

export class AccountUpdatedUserStatusEventPayload {
  @IsOptional()
  @IsUUID()
  employerId?: string;

  @IsEnum(AccountUserStatus)
  userStatus: AccountUserStatus;

  @IsBoolean()
  isAccountActive: boolean;

  @IsBoolean()
  wasAccountActivityChanged: boolean;
}

export class AccountUpdatedUserStatusEvent {
  @IsUUID()
  accountId: string;

  @ValidateNested()
  @Type(() => AccountUpdatedUserStatusEventPayload)
  payload: AccountUpdatedUserStatusEventPayload;
}
