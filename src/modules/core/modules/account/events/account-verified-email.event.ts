import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { AccountSystemStatus } from '../consts/account-system-status.const';

export class AccountVerifiedEmailEventPayload {
  @IsEmail()
  email: string;

  @IsEnum(AccountSystemStatus)
  systemStatus: AccountSystemStatus;

  @IsBoolean()
  isVerified: boolean;
}

export class AccountVerifiedEmailEvent {
  @IsUUID()
  accountId: string;

  @ValidateNested()
  @Type(() => AccountVerifiedEmailEventPayload)
  payload: AccountVerifiedEmailEventPayload;
}
