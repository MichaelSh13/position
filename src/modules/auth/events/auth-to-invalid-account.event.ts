import { IsUUID } from 'class-validator';

export class AuthToInvalidAccountEvent {
  @IsUUID()
  accountId: string;
}

export class AuthToBulkInvalidAccountEvent {
  @IsUUID(undefined, { each: true })
  accountIds: string[];
}
