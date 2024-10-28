import { Controller, Get } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { UserData } from 'src/modules/auth/decorators/user.decorator';
import { ValidationErrorResponse } from 'src/shared/dto/validation-error.response';

import { User } from '../models/user.model';

@ApiTags('User')
@ApiSecurity('JWT-auth')
@Controller('')
export class UserController {
  @Get('/users/me')
  @ApiResponse({ type: User })
  @ApiBadRequestResponse({
    description: 'Validation exception.',
    type: ValidationErrorResponse,
    isArray: true,
  })
  getMe(@UserData() user: User) {
    return user;
  }
}
