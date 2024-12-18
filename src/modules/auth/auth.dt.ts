import type { Request } from 'express';

import type { AccountEntity } from '../core/modules/account/entities/account.entity';
import type { EmployerEntity } from '../core/modules/employer/entities/employer.entity';
import type { EmailTypes } from './consts/email.const';

declare global {
  type CustomRequest = Request & {
    user?: AccountEntity;
  };

  type AccountDataOption = {
    isEmployer?: boolean;
    undefinedError?: boolean;
  };

  type AccountEntityWithEmployer = AccountEntity & {
    employerId: string;
    employer: EmployerEntity;
  };

  type MailRequest = Request & {
    user: Record<string, unknown> & {
      type: EmailTypes;
    };
  };
}
