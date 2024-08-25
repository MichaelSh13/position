import type { ValidationPipeOptions } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import type { ValidationError, ValidatorOptions } from 'class-validator';

export interface ValidationConfig {
  pipeOptions: Omit<ValidationPipeOptions, keyof ValidatorOptions>;
  validationOptions: ValidatorOptions;
}

export default registerAs<ValidationConfig>('validation', async () => {
  const pipeOptions: Omit<ValidationPipeOptions, keyof ValidatorOptions> = {
    transform: true,
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
      return new BadRequestException(validationErrors);
    },
  };
  const validationOptions: ValidatorOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
  };

  return {
    pipeOptions,
    validationOptions,
  };
});
