import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import { EmployerEntity } from '../entities/employer.entity';

export class EmployerVerifiedEventPayload {
  @IsUUID()
  accountId: string;

  @ValidateNested()
  @Type(() => EmployerEntity)
  employer: EmployerEntity;
}

export class EmployerVerifiedEvent {
  @IsUUID()
  employerId: string;

  @ValidateNested()
  @Type(() => EmployerVerifiedEventPayload)
  payload: EmployerVerifiedEventPayload;
}
