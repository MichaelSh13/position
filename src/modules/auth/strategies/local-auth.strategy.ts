import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../services/auth.service';
import type { UserEntity } from '../../core/modules/user/models/user.model';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<UserEntity> {
    try {
      // TODO: Validate DTO here if validatLocal will be called earlier then DTO checking.

      return this.authService.validateLocal(email, password);
    } catch {
      // TODO: Log error with a help of logger and throw just text as custom exceptions.
      throw new UnauthorizedException();
    }
  }
}
