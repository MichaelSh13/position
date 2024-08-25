import { Injectable } from '@nestjs/common';
import type { Logger, QueryRunner } from 'typeorm';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class CustomLoggerTypeOrmService implements Logger {
  private readonly logger = createLogger({
    format: this.getFormat(),
    levels: {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    },
    transports: [
      new transports.File({
        filename: 'logs/database/error.log',
        level: 'error',
        format: this.getFormat('error'),
      }),
      new transports.File({
        filename: 'logs/database/warn.log',
        level: 'warn',
        format: this.getFormat('warn'),
      }),
      new transports.File({
        filename: 'logs/database/info.log',
        level: 'info',
        format: this.getFormat('info'),
      }),
      new transports.File({
        filename: 'logs/database/debug.log',
        level: 'debug',
        format: this.getFormat('debug'),
      }),
    ],
  });

  private getFormat(alwdLevel?: string) {
    return format.combine(
      format((info) =>
        alwdLevel ? (alwdLevel === info.level ? info : false) : info,
      )(),
      format.timestamp(),
      format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}] - ${message}`;
      }),
    );
  }

  log(
    level: 'log' | 'info' | 'warn',
    message: any,
    _queryRunner?: QueryRunner,
  ): any {
    // Log TypeORM logs (queries, migrations, errors, slow queries) using your LoggerService
    const logMessage = `[TypeORM:${level}] ${message}`;
    switch (level) {
      case 'log':
        this.logger.info(logMessage);
        break;
      case 'info':
        this.logger.info(logMessage);
        break;
      case 'warn':
        this.logger.warn(logMessage);
        break;
      default:
        this.logger.error(logMessage);
    }
  }

  logMigration(message: string, _queryRunner?: QueryRunner): any {
    // Log TypeORM migrations
    this.logger.info(`[TypeORM:Migration] ${message}`);
  }

  logQuery(query: string, parameters?: any[], _queryRunner?: QueryRunner): any {
    const params = parameters
      ? `\n[QUERY:PARAMETERS] ${parameters?.toString()};`
      : '';

    this.logger.debug(`[TypeORM:Query] ${query};${params}`);
  }

  logQueryError(
    error: string,
    query: string,
    parameters?: any[],
    _queryRunner?: QueryRunner,
  ): any {
    const params = parameters
      ? `;\n[QUERY:PARAMETERS] ${parameters?.toString()}`
      : '';

    this.logger.error(`[TypeORM:QueryError] ${error}${params};\n${query}`);
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    _queryRunner?: QueryRunner,
  ): any {
    const params = parameters
      ? `\n[QUERY:PARAMETERS] ${parameters?.toString()};`
      : '';

    this.logger.warn(`[TypeORM:QuerySlow] ${query} took ${time}ms;${params}`);
  }

  logSchemaBuild(message: string, _queryRunner?: QueryRunner): any {
    // Log TypeORM schema build
    this.logger.info(`[TypeORM:SchemaBuild] ${message}`);
  }
}
