import { Type } from 'class-transformer';
import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';

export class EmployerBulkUpdatedActivityEventPayload {
  @IsUUID()
  accountId: string;

  @IsUUID()
  employerId: string;

  @IsBoolean()
  isEmployerActive: boolean;
}

export class EmployerBulkUpdatedActivityEvent {
  @ValidateNested({ each: true })
  @Type(() => EmployerBulkUpdatedActivityEventPayload)
  payloads: EmployerBulkUpdatedActivityEventPayload[];
}
