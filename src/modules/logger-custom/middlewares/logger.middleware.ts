import type { NestMiddleware } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

import { LoggerCustomService } from '../services/logger-custom.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  maxDurationMs = 300;

  constructor(private readonly logger: LoggerCustomService) {}

  use(req: Request, res: Response, next: () => void) {
    const startTimestamp = new Date();
    const requestId = req.headers['x-request-id'] || 'N/A'; // You can set the request ID in the request headers

    res.on('finish', () => {
      const endTimestamp = new Date();
      const duration = endTimestamp.getTime() - startTimestamp.getTime();

      const { operationName } = req.body ?? {};
      const keyUid = operationName
        ? `OriginalName: ${operationName}`
        : `ID: ${requestId}`;

      this.logger.debug(`[REQ_DURATION] - ${keyUid}; ${duration}ms;`);

      if (duration > this.maxDurationMs) {
        const requestInfo = {
          method: req.method,
          url: req.url,
          headers: req.headers,
          body: req.body,
          duration: `${duration}ms`,
        };

        this.logger.warn(
          `${keyUid};
          Duration: ${duration}ms;
          Request: ${JSON.stringify(requestInfo)};
          --------------------
          `,
        );
      }
      // Log the end of the request
      // this.logger.debug(
      //   `------------- End of Request (ID: ${requestId}, Duration: ${duration}ms) -------------\n`,
      // );
    });

    next();
  }
}
