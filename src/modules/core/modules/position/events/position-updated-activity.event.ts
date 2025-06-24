import { Type } from 'class-transformer';
import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';

export class PositionUpdatedActivityEventPayload {
  @IsUUID()
  employerId: string;

  @IsBoolean()
  isPositionActive: boolean;
}

export class PositionUpdatedActivityEvent {
  @IsUUID()
  positionId: string;

  @ValidateNested()
  @Type(() => PositionUpdatedActivityEventPayload)
  payload: PositionUpdatedActivityEventPayload;
}
