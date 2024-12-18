import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID, ValidateNested } from 'class-validator';

export class AccountUpdatedActivityEventPayload {
  @IsBoolean()
  isAccountActive: boolean;

  @IsOptional()
  @IsUUID()
  employerId?: string;
}

export class AccountUpdatedActivityEvent {
  @IsUUID()
  accountId: string;

  @ValidateNested()
  @Type(() => AccountUpdatedActivityEventPayload)
  payload: AccountUpdatedActivityEventPayload;
}
