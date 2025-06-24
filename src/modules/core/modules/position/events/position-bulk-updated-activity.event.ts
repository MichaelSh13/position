import { Type } from 'class-transformer';
import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';

export class PositionBulkUpdatedActivityEventPayload {
  @IsUUID()
  employerId: string;

  @IsUUID()
  positionId: string;

  @IsBoolean()
  isPositionActive: boolean;
}

export class PositionBulkUpdatedActivityEvent {
  @ValidateNested({ each: true })
  @Type(() => PositionBulkUpdatedActivityEventPayload)
  payloads: PositionBulkUpdatedActivityEventPayload[];
}
