import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthController } from './controllers/auth.controller';
import { JwtAuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { AuthJwtStrategy } from './strategies/auth-jwt.strategy';
import { LocalAuthStrategy } from './strategies/local-auth.strategy';
import { UserModule } from '../core/modules/user/user.module';
import { JsonWebTokenModule } from '../json-web-token/json-web-token.module';

@Module({
  imports: [JsonWebTokenModule, UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthJwtStrategy,
    LocalAuthStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
