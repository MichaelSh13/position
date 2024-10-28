import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

import type { AccountEntity } from '../../core/modules/account/entities/account.entity';

export const AccountData = createParamDecorator(
  // { isEmployer = false, undefinedError = true }: AccountDataOption = {},
  (_data: unknown, ectx: ExecutionContext): AccountEntity | undefined => {
    if (ectx.getType() === 'http') {
      const ctx = ectx.switchToHttp();
      const req = ctx.getRequest<CustomRequest>();

      // if (undefinedError && !req.user) {
      //   // TODO: Use custom error.
      //   throw new NotFoundException('Not found account.');
      // }

      // if (!isEmployer) {
      //   return req.user;
      // }

      // if (!req.user?.employerId) {
      //   // TODO: Use custom error.
      //   throw new NotFoundException('Account is not Employer.');
      // }

      return req.user;
    }

    // throw new NotFoundException('Not found account data.');
  },
);
