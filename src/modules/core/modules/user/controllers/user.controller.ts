import { Controller, Get } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ValidationErrorResponse } from 'src/dto/validation-error.response';
import { UserData } from 'src/modules/auth/decorators/user.decorator';

import { UserEntity } from '../entities/user.entity';

@ApiTags('User')
@ApiSecurity('JWT-auth')
@Controller('')
export class UserController {
  @Get('/users/me')
  @ApiResponse({ type: UserEntity })
  @ApiBadRequestResponse({
    description: 'Validation exception.',
    type: ValidationErrorResponse,
    isArray: true,
  })
  getMe(@UserData() user: UserEntity) {
    return user;
  }
}
