import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { AccountSystemStatus } from '../consts/account-system-status.const';

export class AccountUpdatedSystemStatusEventPayload {
  @IsOptional()
  @IsUUID()
  employerId?: string;

  @IsEnum(AccountSystemStatus)
  systemStatus: AccountSystemStatus;

  @IsBoolean()
  isAccountActive: boolean;

  @IsBoolean()
  wasAccountActivityChanged: boolean;
}

export class AccountUpdatedSystemStatusEvent {
  @IsUUID()
  accountId: string;

  @ValidateNested()
  @Type(() => AccountUpdatedSystemStatusEventPayload)
  payload: AccountUpdatedSystemStatusEventPayload;
}
