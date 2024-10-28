import { IsObject, IsUUID } from 'class-validator';

export class EmailSendedEvent implements BaseEvent {
  @IsUUID()
  id: string;

  @IsObject()
  payload: Record<string, unknown>;
}
