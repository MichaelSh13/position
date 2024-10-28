import { SetMetadata } from '@nestjs/common';

import type { EmailTypes } from '../consts/email.const';

export const MAIL_TYPE_KEY = 'MAIL_TYPE_KEY';

export const SetMail = (emailType: EmailTypes) => {
  return SetMetadata(MAIL_TYPE_KEY, emailType);
};
