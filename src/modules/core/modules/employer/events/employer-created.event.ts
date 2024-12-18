import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

export class EmployerCreatedEventPayload {
  @IsUUID()
  accountId: string;
}

export class EmployerCreatedEvent {
  @IsUUID()
  employerId: string;

  @ValidateNested()
  @Type(() => EmployerCreatedEventPayload)
  payload: EmployerCreatedEventPayload;
}
