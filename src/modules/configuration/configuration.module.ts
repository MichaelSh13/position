import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import common from './configs/common.config';
import database from './configs/database.config';
import jwt from './configs/jwt.config';
import validations from './configs/validation.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [common, database, validations, jwt],
    }),
  ],
})
export class ConfigurationModule {}
