import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { AccountSystemStatus } from '../consts/account-system-status.const';

export class AccountBulkUpdatedSystemStatusEventPayload {
  @IsUUID()
  accountId: string;

  @IsOptional()
  @IsUUID()
  employerId?: string;

  @IsBoolean()
  isAccountActive: boolean;

  @IsBoolean()
  wasAccountActivityChanged: boolean;
}

export class AccountBulkUpdatedSystemStatusEvent {
  @IsEnum(AccountSystemStatus)
  systemStatus: AccountSystemStatus;

  @ValidateNested({ each: true })
  @Type(() => AccountBulkUpdatedSystemStatusEventPayload)
  payloads: AccountBulkUpdatedSystemStatusEventPayload[];
}
