import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { JsonWebTokenService } from './services/json-web-token.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.getOrThrow('jwt.access'),
    }),
  ],
  providers: [JsonWebTokenService],
  exports: [JsonWebTokenService],
})
export class JsonWebTokenModule {}
