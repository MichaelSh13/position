import { IsEmail, IsEnum, IsUUID } from 'class-validator';

import { EmailTypes } from '../consts/email.const';

export class ConfirmationDto {
  @IsEmail()
  email: string;

  @IsUUID()
  accountId: string;

  @IsEnum(EmailTypes)
  type: EmailTypes;
}
