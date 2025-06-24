import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsUUID, ValidateNested } from 'class-validator';

import { JobApplicationSystemStatus } from '../consts/job-application-system-status.const';

export class JobApplicationChangedSystemStatusEventPayload {
  @IsEnum(JobApplicationSystemStatus)
  systemStatus: JobApplicationSystemStatus;

  @IsBoolean()
  isJobApplicationActive: boolean;

  @IsBoolean()
  wasJobApplicationActivityChanged: boolean;
}

export class JobApplicationUpdatedSystemStatusEvent {
  @IsUUID()
  jobApplicationId: string;

  @ValidateNested()
  @Type(() => JobApplicationChangedSystemStatusEventPayload)
  payload: JobApplicationChangedSystemStatusEventPayload;
}
