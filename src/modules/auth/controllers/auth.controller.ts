import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { IsPublic } from '../decorators/is-public.decorator';
import { UserData } from '../decorators/user.decorator';
import { LoginDto } from '../dto/login.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { RegistrationDto } from '../dto/registration.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';
import { UserEntity } from '../../core/modules/user/entities/user.entity';

@IsPublic()
@ApiTags('Auth')
@ApiSecurity('JWT-auth')
@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/login')
  @UseGuards(LocalAuthGuard)
  @ApiOkResponse({ type: LoginResponseDto })
  login(
    @UserData() user: UserEntity,
    @Body() _: LoginDto,
  ): Promise<LoginResponseDto> {
    return this.authService.login(user);
  }

  @Post('auth/registration')
  registration(
    @Body() { passwordConfirm: _, ...registrationData }: RegistrationDto,
  ) {
    return this.authService.registration(registrationData);
  }
}
