import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import { AccountEntity } from '../entities/account.entity';

export class AccountUpdatedEvent implements BaseEvent {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => AccountEntity)
  payload: AccountEntity;
}
