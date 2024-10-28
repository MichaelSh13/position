import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';

@Injectable()
export class JwtMailStrategy extends PassportStrategy(
  Strategy,
  'jwt-mail-token',
) {
  constructor(readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.mail.secret'),
    } as StrategyOptions);
  }

  async validate(payload: unknown) {
    return payload;
  }
}
