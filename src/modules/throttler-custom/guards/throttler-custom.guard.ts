import type { ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerCustomGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const contextType = context.getType<'http' | 'graphql'>();

    if (contextType === 'http') {
      const httpContext = context.switchToHttp();
      const request = httpContext.getRequest();
      const response = httpContext.getResponse();
      return { req: request, res: response };
    } else {
      throw new Error('Unsupported context type');
    }
  }
}
