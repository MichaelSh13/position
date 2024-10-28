import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import { AccountEntity } from '../../account/entities/account.entity';

export class EmployerVerifiedEventPayload {
  @ValidateNested()
  @Type(() => AccountEntity)
  account: AccountEntity;
}

export class EmployerVerifiedEvent implements BaseEvent {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => EmployerVerifiedEventPayload)
  payload: EmployerVerifiedEventPayload;
}
