import { Type } from 'class-transformer';
import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';

export class EmployerUpdatedActivityEventPayload {
  @IsUUID()
  accountId: string;

  @IsBoolean()
  isEmployerActive: boolean;
}

export class EmployerUpdatedActivityEvent {
  @IsUUID()
  employerId: string;

  @ValidateNested()
  @Type(() => EmployerUpdatedActivityEventPayload)
  payload: EmployerUpdatedActivityEventPayload;
}
