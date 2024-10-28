import { Injectable } from '@nestjs/common';
import type { LogCallback } from 'winston';
import { createLogger, format, transports } from 'winston';

interface LeveledLogMethod {
  (message: string, callback: LogCallback): void;
  (message: string, meta: any, callback: LogCallback): void;
  (message: string, ...meta: any[]): void;
  (message: any): void;
  (infoObject: object): void;
}

interface LoggerServiceI {
  error: LeveledLogMethod;
  warn: LeveledLogMethod;
  info: LeveledLogMethod;
  debug: LeveledLogMethod;
}

@Injectable()
export class LoggerCustomService implements LoggerServiceI {
  private readonly logger = createLogger({
    format: this.getFormat(),
    levels: {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      // combined: 4,
    },
    transports: [
      new transports.Console({ level: 'debug' }),

      new transports.File({
        filename: 'logs/error.log',
        level: 'error',
        // format: this.getFormat('error'),
      }),
      new transports.File({
        filename: 'logs/warn.log',
        level: 'warn',
        // format: this.getFormat('warn'),
      }),
      new transports.File({
        filename: 'logs/info.log',
        level: 'info',
        // format: this.getFormat('info'),
      }),
      new transports.File({
        filename: 'logs/debug.log',
        level: 'debug',
        // format: this.getFormat('debug'),
      }),

      // new transports.File({
      //   filename: 'logs/combined.log',
      //   level: 'combined',
      //   // format: this.getFormat(),
      // }),
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

  error(...options: any[]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.logger.error(...options);
  }

  warn(...options: any[]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.logger.warn(...options);
  }

  info(...options: any[]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.logger.info(...options);
  }

  log(...options: any[]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.logger.info(...options);
  }

  debug(...options: any[]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.logger.debug(...options);
  }
}
