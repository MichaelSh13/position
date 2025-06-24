import { Type } from 'class-transformer';
import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';

export class JobApplicationBulkUpdatedActivityEventPayload {
  @IsUUID()
  jobApplicationId: string;

  @IsUUID()
  positionId: string;

  @IsBoolean()
  isJobApplicationActive: boolean;
}

export class JobApplicationBulkUpdatedActivityEvent {
  @ValidateNested({ each: true })
  @Type(() => JobApplicationBulkUpdatedActivityEventPayload)
  payloads: JobApplicationBulkUpdatedActivityEventPayload[];
}
