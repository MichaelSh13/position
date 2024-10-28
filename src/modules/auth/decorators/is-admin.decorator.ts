import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator, NotFoundException } from '@nestjs/common';
import { AccountRoles } from 'src/modules/permission/consts/permission.const';

export const IsAdmin = createParamDecorator(
  (_data: unknown, ectx: ExecutionContext): boolean => {
    if (ectx.getType() === 'http') {
      const ctx = ectx.switchToHttp();
      const req = ctx.getRequest<CustomRequest>();

      const isAdmin = req.user?.roles?.includes(AccountRoles.ADMIN);

      return Boolean(isAdmin);
    }

    // TODO: Create error instance
    throw new NotFoundException('Not found account data.');
  },
);
