import { registerAs } from '@nestjs/config';
import type { MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { config as dotenvConfig } from 'dotenv';

import { DatabaseDto } from '../dto/database.dto';

dotenvConfig({ path: '.env' });

// TODO: add validation.
export default registerAs(
  'database',
  async (): Promise<MongooseModuleFactoryOptions> => {
    const config = {
      host: Number(process.env.DB_HOST),
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

    const dbData = plainToInstance(DatabaseDto, config);
    const errors = await validate(dbData);
    errors.forEach((error) => {
      throw new Error(error.toString());
    });

    const mongoConfig: MongooseModuleFactoryOptions = {
      uri: `mongodb://${dbData.host}:${dbData.port}`,
      user: dbData.username,
      pass: dbData.password,
      dbName: dbData.database,
    };

    return mongoConfig;
  },
);
