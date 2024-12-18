import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsUUID, ValidateNested } from 'class-validator';

import { EmployerSystemStatus } from '../consts/employer-system-status.const';

export class EmployerBulkUpdatedSystemStatusEventPayload {
  @IsUUID()
  accountId: string;

  @IsUUID()
  employerId: string;

  @IsBoolean()
  isEmployerActive: boolean;

  @IsBoolean()
  wasEmployerActivityChanged: boolean;
}

export class EmployerBulkUpdatedSystemStatusEvent {
  @IsEnum(EmployerSystemStatus)
  systemStatus: EmployerSystemStatus;

  @ValidateNested({ each: true })
  @Type(() => EmployerBulkUpdatedSystemStatusEventPayload)
  payloads: EmployerBulkUpdatedSystemStatusEventPayload[];
}
