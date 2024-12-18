import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class EmployerChangedActivityPayloadEvent {
  @IsOptional()
  @IsString()
  reason: string | null;

  @IsUUID()
  accountId: string;
}

export class EmployerChangedActivityEvent {
  @IsUUID()
  employerId: string;

  @ValidateNested()
  @Type(() => EmployerChangedActivityPayloadEvent)
  payload: EmployerChangedActivityPayloadEvent;
}

export class EmployerBulkChangedActivityPayloadEvent {
  @IsUUID()
  employerId: string;

  @IsUUID()
  accountId: string;
}

export class EmployerBulkChangedActivityEvent {
  @IsString()
  reason: string;

  @ValidateNested({ each: true })
  @Type(() => EmployerBulkChangedActivityPayloadEvent)
  payloads: EmployerBulkChangedActivityPayloadEvent[];
}
