import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsUUID, ValidateNested } from 'class-validator';

import { JobApplicationUserStatus } from '../consts/job-application-user-status.const';

export class JobApplicationUpdatedUserStatusEventPayload {
  @IsEnum(JobApplicationUserStatus)
  userStatus: JobApplicationUserStatus;

  @IsBoolean()
  isJobApplicationActive: boolean;

  @IsBoolean()
  wasJobApplicationActivityChanged: boolean;
}

export class JobApplicationUpdatedUserStatusEvent {
  @IsUUID()
  jobApplicationId: string;

  @ValidateNested()
  @Type(() => JobApplicationUpdatedUserStatusEventPayload)
  payload: JobApplicationUpdatedUserStatusEventPayload;
}
