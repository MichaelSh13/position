import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { EmailTypes } from '../consts/email.const';
import { MAIL_TYPE_KEY } from '../decorators/set-mail.decorator';

@Injectable()
export default class JwtMailGuard
  extends AuthGuard('jwt-mail-token')
  implements CanActivate
{
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const emailType = this.reflector.getAllAndOverride<EmailTypes | undefined>(
      MAIL_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!emailType) {
      return false;
    }

    const guard = await super.canActivate(context);
    if (!guard) {
      return false;
    }

    const { type } = context.switchToHttp().getRequest<MailRequest>().user;
    if (emailType !== type) {
      return false;
    }

    return true;
  }
}
