import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID, ValidateNested } from 'class-validator';

export class AccountBulkUpdatedActivityEventPayload {
  @IsBoolean()
  isAccountActive: boolean;

  @IsOptional()
  @IsUUID()
  employerId?: string;

  @IsUUID()
  accountId: string;
}

export class AccountBulkUpdatedActivityEvent {
  @ValidateNested({ each: true })
  @Type(() => AccountBulkUpdatedActivityEventPayload)
  payloads: AccountBulkUpdatedActivityEventPayload[];
}
