import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import { JobApplicationEntity } from '../entities/job-application.entity';

export class JobApplicationCreatedEvent implements BaseEvent {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => JobApplicationEntity)
  payload: JobApplicationEntity;
}