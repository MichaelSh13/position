import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import { JobApplicationEntity } from '../entities/job-application.entity';

export class JobApplicationChangedStatusEventPayload {
  @ValidateNested()
  @Type(() => JobApplicationEntity)
  jobApplication: JobApplicationEntity;
}

export class JobApplicationChangedStatusEvent {
  @IsUUID()
  jobApplicationId: string;

  @ValidateNested()
  @Type(() => JobApplicationChangedStatusEventPayload)
  payload: JobApplicationChangedStatusEventPayload;
}
