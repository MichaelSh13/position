import { Type } from 'class-transformer';
import { IsDate, IsUUID, ValidateNested } from 'class-validator';

export class AccountRevokeVerificationEventPayload {
  @IsUUID()
  adminId: string;

  @IsDate()
  revokeVerificationSince: Date;
}

export class AccountRevokeVerificationEvent {
  @IsUUID()
  accountId: string;

  @ValidateNested()
  @Type(() => AccountRevokeVerificationEventPayload)
  payload: AccountRevokeVerificationEventPayload;
}
