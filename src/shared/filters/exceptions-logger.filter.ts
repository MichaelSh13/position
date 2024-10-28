import {
  ArgumentsHost,
  Catch,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { LoggerCustomService } from 'src/modules/logger-custom/services/logger-custom.service';

@Catch()
export class ExceptionsLoggerFilter extends BaseExceptionFilter {
  constructor(private readonly logger: LoggerCustomService) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const _response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : new InternalServerErrorException().getStatus();

    // TODO?: Here we may got problem with double logging. If Exception that been throwed was logged, so it will be logged twice.
    this.logger.error({
      message: exception instanceof Error ? exception.message : 'Unknown error',
      stack: exception instanceof Error ? exception.stack : null,
      status,
      path: request.url,
      method: request.method,
    });

    super.catch(exception, host);
  }
}
