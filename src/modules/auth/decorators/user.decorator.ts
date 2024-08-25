import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator, NotFoundException } from '@nestjs/common';

import type { UserEntity } from '../../core/modules/user/entities/user.entity';

export const UserData = createParamDecorator(
  (_data: unknown, ectx: ExecutionContext): UserEntity | undefined => {
    if (ectx.getType() === 'http') {
      const ctx = ectx.switchToHttp();
      const req = ctx.getRequest<CustomRequest>();

      return req.user;
    }

    throw new NotFoundException('Not found user data.');
  },
);
