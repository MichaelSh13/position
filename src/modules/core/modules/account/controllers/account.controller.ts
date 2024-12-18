import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AccessGuard, Actions, UseAbility } from 'nest-casl';
import { AccountData } from 'src/modules/auth/decorators/account-data.decorator';
import { ValidationErrorResponse } from 'src/shared/dto/validation-error.response';

import { AccountSystemStatus } from '../consts/account-system-status.const';
import { AccountUserStatus } from '../consts/account-user-status.const';
import { AccountEntity } from '../entities/account.entity';
import { AccountService } from '../services/account.service';

@ApiTags('Account')
@ApiSecurity('JWT-auth')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('')
  @ApiResponse({ type: AccountEntity })
  @ApiBadRequestResponse({
    description: 'Validation exception.',
    type: ValidationErrorResponse,
    isArray: true,
  })
  @UseGuards(AccessGuard)
  @UseAbility(Actions.read, AccountEntity)
  getMe(@AccountData() account: AccountEntity) {
    return account;
  }

  @Patch('user-status/:userStatus')
  @HttpCode(204)
  @UseGuards(AccessGuard)
  @UseAbility(Actions.update, AccountEntity)
  changeAccountUserStatus(
    @Param('userStatus', new ParseEnumPipe(AccountUserStatus))
    userStatus: AccountUserStatus,
    @AccountData() account: AccountEntity,
  ): Promise<void> {
    return this.accountService.changeAccountUserStatus(account, userStatus);
  }

  @Patch(':accountId/system-status/:systemStatus')
  @HttpCode(204)
  @UseGuards(AccessGuard)
  @UseAbility(Actions.manage, AccountEntity)
  changeAccountSystemStatus(
    @Param('accountId', new ParseUUIDPipe()) accountId: string,
    @Param('systemStatus', new ParseEnumPipe(AccountSystemStatus))
    systemStatus: AccountSystemStatus,
    @AccountData() admin: AccountEntity,
  ): Promise<void> {
    return this.accountService.changeAccountSystemStatus(
      accountId,
      systemStatus,
      admin.id,
    );
  }
}
