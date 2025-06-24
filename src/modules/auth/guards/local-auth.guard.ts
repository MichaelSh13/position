import {
  BadRequestException,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor() {
    super({});
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const res = await super.canActivate(context);

      return res as boolean;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw new BadRequestException('Data are not properly provided.');
      }

      throw err;
    }
  }
}
