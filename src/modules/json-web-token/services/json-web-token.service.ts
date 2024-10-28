import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

// TODO: check again
@Injectable()
export class JsonWebTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: Record<string, unknown>) {
    return this.jwtService.sign(
      {
        ...payload,
      },
      {
        privateKey: this.configService.getOrThrow(`jwt.access.privateKey`),
        expiresIn: this.configService.getOrThrow(
          `jwt.access.signOptions.expiresIn`,
        ),
        algorithm: this.configService.getOrThrow(
          `jwt.access.signOptions.algorithm`,
        ),
      },
    );
  }

  generateMailToken(payload: Record<string, any>): string {
    console.log(payload);
    try {
      return this.jwtService.sign(payload, {
        algorithm: 'HS256',
        secret: this.configService.getOrThrow(`jwt.mail.secret`),
      });
    } catch (err) {
      // TODO: err
      console.log(err);
      throw new BadRequestException('Error generating mail token');
    }
  }
}
