import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import { EmployerEntity } from '../entities/employer.entity';

export class EmployerUpdatedEventPayload {
  @IsUUID()
  accountId: string;

  @ValidateNested()
  @Type(() => EmployerEntity)
  employer: EmployerEntity;
}

export class EmployerUpdatedEvent {
  @IsUUID()
  employerId: string;

  @ValidateNested()
  @Type(() => EmployerUpdatedEventPayload)
  payload: EmployerUpdatedEventPayload;
}
