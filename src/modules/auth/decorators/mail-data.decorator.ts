import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator, UnauthorizedException } from '@nestjs/common';

export const MailData = createParamDecorator(
  (_data: unknown, ectx: ExecutionContext) => {
    if (ectx.getType() !== 'http') {
      throw new UnauthorizedException('Not found user data.');
    }

    const ctx = ectx.switchToHttp();
    const req = ctx.getRequest<MailRequest>();

    return req.user;
  },
);
