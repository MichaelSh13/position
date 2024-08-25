import {
  ArgumentsHost,
  Catch,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { CustomLoggerService } from 'src/modules/custom-logger/services/custom-logger.service';

@Catch()
export class ExceptionsLoggerFilter extends BaseExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {
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
