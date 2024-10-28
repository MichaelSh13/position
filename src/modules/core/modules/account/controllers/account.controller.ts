import { Controller, Get } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AccountData } from 'src/modules/auth/decorators/account-data.decorator';
import { ValidationErrorResponse } from 'src/shared/dto/validation-error.response';

import { AccountEntity } from '../entities/account.entity';

@ApiTags('Account')
@ApiSecurity('JWT-auth')
@Controller('account')
export class AccountController {
  @Get('me')
  @ApiResponse({ type: AccountEntity })
  @ApiBadRequestResponse({
    description: 'Validation exception.',
    type: ValidationErrorResponse,
    isArray: true,
  })
  getMe(@AccountData() account: AccountEntity) {
    return account;
  }
}
