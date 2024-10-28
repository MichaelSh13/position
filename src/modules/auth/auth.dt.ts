import type { Request } from 'express';

import type { EmailTypes } from './consts/email.const';
import type { AccountEntity } from '../core/modules/account/entities/account.entity';

declare global {
  type PayloadAccount = {
    account: AccountEntity;
    iat: number;
    exp: number;
  };

  type CustomRequest = Request & {
    user?: AccountEntity;
  };

  type AccountDataOption = {
    isEmployer?: boolean;
    undefinedError?: boolean;
  };

  type AccountEntityWithEmployer = AccountEntity & {
    employerId: string;
  };

  type MailRequest = Request & {
    user: Record<string, unknown> & {
      type: EmailTypes;
    };
  };
}
