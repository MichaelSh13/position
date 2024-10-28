import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

export class AccountVerifiedPayloadDto {
  @IsUUID()
  accountId: string;
}

export class AccountVerifiedEvent implements BaseEvent {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => AccountVerifiedPayloadDto)
  payload: AccountVerifiedPayloadDto;
}
