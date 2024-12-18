import { IsObject, IsUUID } from 'class-validator';

export class EmailSendedEvent {
  @IsUUID()
  emailId: string;

  @IsObject()
  payload: Record<string, unknown>;
}
