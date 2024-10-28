import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { EmailTypes } from '../consts/email.const';
import { CONFIRM_EMAIL_ENDPOINT_NAME } from '../consts/endpoint-names.const';
import { AccountData } from '../decorators/account-data.decorator';
import { IsPublic } from '../decorators/is-public.decorator';
import { MailData } from '../decorators/mail-data.decorator';
import { SetMail } from '../decorators/set-mail.decorator';
import { ConfirmationDto } from '../dto/confirmation.dto';
import { LoginDto } from '../dto/login.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { RegistrationDto } from '../dto/registration.dto';
import JwtMailGuard from '../guards/jwt-mail.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';
import { AccountEntity } from '../../core/modules/account/entities/account.entity';

@IsPublic()
@ApiTags('Auth')
@ApiSecurity('JWT-auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBody({ type: LoginDto })
  login(@AccountData() account: AccountEntity): Promise<LoginResponseDto> {
    return this.authService.login(account);
  }

  @Post('registration')
  @HttpCode(204)
  registration(@Body() registrationData: RegistrationDto) {
    return this.authService.registration(registrationData);
  }

  @Get(CONFIRM_EMAIL_ENDPOINT_NAME)
  @UseGuards(JwtMailGuard)
  @SetMail(EmailTypes.VERIFICATION)
  @Redirect()
  confirmEmail(@MailData() confirmationDto: ConfirmationDto) {
    return this.authService.confirmEmail(confirmationDto);
  }
}
