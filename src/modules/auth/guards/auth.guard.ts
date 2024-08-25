import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Observable } from 'rxjs';

import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(ectx: ExecutionContext): CustomRequest {
    if (ectx.getType() === 'http') {
      const ctx = ectx.switchToHttp();
      const req = ctx.getRequest<CustomRequest>();

      return req;
    }

    throw new BadRequestException();
  }

  canActivate(
    context: ExecutionContext,
  ): Promise<boolean> | boolean | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
