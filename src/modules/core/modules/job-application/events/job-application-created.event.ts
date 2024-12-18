import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import { JobApplicationEntity } from '../entities/job-application.entity';

export class JobApplicationCreatedEventPayload {
  @ValidateNested()
  @Type(() => JobApplicationEntity)
  jobApplication: JobApplicationEntity;
}

export class JobApplicationCreatedEvent {
  @IsUUID()
  jobApplicationId: string;

  @ValidateNested()
  @Type(() => JobApplicationCreatedEventPayload)
  payload: JobApplicationCreatedEventPayload;
}
