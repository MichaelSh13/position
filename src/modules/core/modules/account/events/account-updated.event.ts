import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import { AccountEntity } from '../entities/account.entity';

export class AccountUpdatedEventPayload {
  @ValidateNested()
  @Type(() => AccountEntity)
  previous: AccountEntity;

  @ValidateNested()
  @Type(() => AccountEntity)
  updated: AccountEntity;
}

export class AccountUpdatedEvent {
  @IsUUID()
  accountId: string;

  @ValidateNested()
  @Type(() => AccountUpdatedEventPayload)
  payload: AccountUpdatedEventPayload;
}
