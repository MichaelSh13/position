import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import { EmployerEntity } from '../entities/employer.entity';

export class EmployerUpdatedEventPayload {
  @ValidateNested()
  @Type(() => EmployerEntity)
  employer: EmployerEntity;
}

export class EmployerUpdatedEvent implements BaseEvent {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => EmployerUpdatedEventPayload)
  payload: EmployerUpdatedEventPayload;
}
