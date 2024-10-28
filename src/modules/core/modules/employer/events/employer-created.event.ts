import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import { EmployerEntity } from '../entities/employer.entity';
import { AccountEntity } from '../../account/entities/account.entity';

export class EmployerCreatedEventPayload {
  @ValidateNested()
  @Type(() => AccountEntity)
  account: AccountEntity;

  @ValidateNested()
  @Type(() => EmployerEntity)
  employer: EmployerEntity;
}

export class EmployerCreatedEvent implements BaseEvent {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => EmployerCreatedEventPayload)
  payload: EmployerCreatedEventPayload;
}
