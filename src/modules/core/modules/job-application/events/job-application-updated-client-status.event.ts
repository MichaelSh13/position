import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsUUID, ValidateNested } from 'class-validator';

import { JobApplicationClientStatus } from '../consts/job-application-client-status.const';

export class JobApplicationChangedClientStatusEventPayload {
  @IsEnum(JobApplicationClientStatus)
  clientStatus: JobApplicationClientStatus;

  @IsBoolean()
  isJobApplicationActive: boolean;

  @IsBoolean()
  wasJobApplicationActivityChanged: boolean;
}

export class JobApplicationUpdatedClientStatusEvent {
  @IsUUID()
  jobApplicationId: string;

  @ValidateNested()
  @Type(() => JobApplicationChangedClientStatusEventPayload)
  payload: JobApplicationChangedClientStatusEventPayload;
}
