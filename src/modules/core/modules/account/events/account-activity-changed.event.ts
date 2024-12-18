import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';

export class AccountChangedActivityPayloadEvent {
  @IsOptional()
  @IsUUID()
  employerId?: string;
}

export class AccountChangedActivityEvent {
  @IsUUID()
  accountId: string;

  @ValidateNested()
  @Type(() => AccountChangedActivityPayloadEvent)
  payload: AccountChangedActivityPayloadEvent;
}

export class AccountBulkChangedActivityPayloadEvent {
  @IsOptional()
  @IsUUID()
  employerId?: string;

  @IsUUID()
  accountId: string;
}

export class AccountBulkChangedActivityEvent {
  @ValidateNested({ each: true })
  @Type(() => AccountBulkChangedActivityPayloadEvent)
  payloads: AccountBulkChangedActivityPayloadEvent[];
}
