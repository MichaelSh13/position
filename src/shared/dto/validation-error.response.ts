import { ApiProperty } from '@nestjs/swagger';
import type { ValidationError } from 'class-validator/types/validation/ValidationError';

export class ValidationErrorResponse implements ValidationError {
  @ApiProperty({ required: false, type: Object })
  target?: object | undefined;

  @ApiProperty({ type: String })
  property: string;

  @ApiProperty({ required: false })
  value?: any;

  @ApiProperty({ required: false, type: Object })
  constraints?: { [type: string]: string } | undefined;

  @ApiProperty({
    required: false,
    type: ValidationErrorResponse,
    isArray: true,
  })
  children?: ValidationError[] | undefined;

  @ApiProperty({ required: false, type: Object })
  contexts?: { [type: string]: any } | undefined;
}
