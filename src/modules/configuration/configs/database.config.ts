import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { config as dotenvConfig } from 'dotenv';
import * as fs from 'fs';
import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';

import { DatabaseDto } from '../dto/database.dto';

dotenvConfig({ path: '.env' });

const enableSSL = process.env.SSL_MODE ?? true;
const certificate =
  process.env.NODE_ENV === 'production' &&
  enableSSL &&
  (process.env.SSL_CERT ?? fs.readFileSync('ca-certificate.crt').toString());

const typeormConfig = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  autoLoadEntities: true,
  logging: true,
  ssl: certificate && {
    ca: certificate,
  },
  entities: ['dist/**/*.entity.js'],
  subscribers: ['dist/**/*.subscriber.js'],
  migrationsTableName: 'custom_migration_table',
  migrations: ['dist/src/modules/database/migrations/*.js'],
  cli: {
    migrationsDir: 'src/modules/database/migrations',
  },
} as TypeOrmModuleOptions;

export const connectionSource = new DataSource(
  typeormConfig as DataSourceOptions,
);

// TODO: add validation.
export default registerAs(
  'database',
  async (): Promise<TypeOrmModuleOptions> => {
    const instance = plainToInstance(DatabaseDto, typeormConfig);
    const errors = await validate(instance);
    errors.forEach((error) => {
      throw new Error(error.toString());
    });

    return typeormConfig;
  },
);
