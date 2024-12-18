import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsUUID, ValidateNested } from 'class-validator';

export class AuthRegisteredEventPayload {
  // @ValidateNested()
  // @Type(() => AccountEntity)
  // account: AccountEntity;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class AuthRegisteredEvent {
  @IsUUID()
  accountId: string;

  @ValidateNested()
  @Type(() => AuthRegisteredEventPayload)
  payload: AuthRegisteredEventPayload;
}
