import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

// TODO: check again
@Injectable()
export class JsonWebTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: Record<string, any>) {
    return this.jwtService.sign(
      {
        ...payload,
      },
      {
        privateKey: this.configService.get(`jwt.access.privateKey`),
        expiresIn: this.configService.get(`jwt.access.signOptions.expiresIn`),
        algorithm: this.configService.get(`jwt.access.signOptions.algorithm`),
      },
    );
  }
}
