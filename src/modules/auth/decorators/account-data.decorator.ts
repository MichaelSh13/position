import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { AccountEntity } from '../../core/modules/account/entities/account.entity';

export const AccountData = createParamDecorator(
  (_data: unknown, ectx: ExecutionContext): AccountEntity | undefined => {
    if (ectx.getType() !== 'http') {
      throw new NotFoundException('Not found account data.');
    }

    const ctx = ectx.switchToHttp();
    const req = ctx.getRequest<CustomRequest>();
    const account = plainToInstance(AccountEntity, req.user);

    return account;
  },
);
