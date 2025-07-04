import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Strategy } from 'passport-local';

import type { AccountEntity } from '../../core/modules/account/entities/account.entity';
import { LoginDto } from '../dto/login.dto';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<AccountEntity> {
    // TODO: Validate DTO here if validateLocal will be called earlier then DTO checking.
    const loginData = plainToInstance(LoginDto, { username, password });
    const errors = await validate(loginData);
    errors.forEach((err) => {
      const keys = Object.keys(err.constraints ?? {});
      const message =
        err.constraints && keys.length && err.constraints[keys[0]];

      throw new BadRequestException(message);
    });

    try {
      const account = await this.authService.validateLocal(username, password);

      return account;
    } catch {
      // TODO: Log error with a help of logger and throw just text as custom exceptions.
      throw new ForbiddenException('Wrong username or password');
    }
  }
}
