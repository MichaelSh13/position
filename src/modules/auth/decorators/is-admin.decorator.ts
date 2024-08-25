import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator, NotFoundException } from '@nestjs/common';

import { UserRoles } from '../../core/modules/user/consts/user-roles.enum';

export const IsAdmin = createParamDecorator(
  (_data: unknown, ectx: ExecutionContext): boolean => {
    if (ectx.getType() === 'http') {
      const ctx = ectx.switchToHttp();
      const req = ctx.getRequest<CustomRequest>();

      const isAdmin = req.user?.roles.includes(UserRoles.ADMIN);

      return Boolean(isAdmin);
    }

    throw new NotFoundException('Not found user data.');
  },
);
