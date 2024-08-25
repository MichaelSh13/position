import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { StrategyOptions } from 'passport-jwt';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.access.publicKey'),
      algorithms: [configService.get('jwt.access.signOptions.algorithm')],
    } as StrategyOptions);
  }

  async validate(payload: PayloadUser) {
    return this.authService.validate(payload);
  }
}
