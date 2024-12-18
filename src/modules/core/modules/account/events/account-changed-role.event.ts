import { IsUUID } from 'class-validator';

export class AccountChangedRoleEvent {
  @IsUUID()
  accountId: string;
}
