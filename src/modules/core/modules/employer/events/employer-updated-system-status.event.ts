import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsUUID, ValidateNested } from 'class-validator';

import { EmployerSystemStatus } from '../consts/employer-system-status.const';

export class EmployerUpdatedSystemStatusEventPayload {
  @IsUUID()
  accountId: string;

  @IsEnum(EmployerSystemStatus)
  systemStatus: EmployerSystemStatus;

  @IsBoolean()
  isEmployerActive: boolean;

  @IsBoolean()
  wasEmployerActivityChanged: boolean;
}

export class EmployerUpdatedSystemStatusEvent {
  @IsUUID()
  employerId: string;

  @ValidateNested()
  @Type(() => EmployerUpdatedSystemStatusEventPayload)
  payload: EmployerUpdatedSystemStatusEventPayload;
}
