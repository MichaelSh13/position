import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import { AccountEntity } from '../entities/account.entity';

export class AccountCreatedEventPayload {
  @ValidateNested()
  @Type(() => AccountEntity)
  account: AccountEntity;
}

export class AccountCreatedEvent {
  @IsUUID()
  accountId: string;

  @ValidateNested()
  @Type(() => AccountCreatedEventPayload)
  payload: AccountCreatedEventPayload;
}
