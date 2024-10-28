import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AccessGuard, Actions, UseAbility } from 'nest-casl';
import { AccountData } from 'src/modules/auth/decorators/account-data.decorator';

import { EmployerEntity } from '../entities/employer.entity';
import { EmployerService } from '../services/employer.service';
import { AccountEntity } from '../../account/entities/account.entity';

@ApiTags('Employer')
@ApiSecurity('JWT-auth')
@Controller('employer')
export class EmployerController {
  constructor(private readonly employerService: EmployerService) {}
  @Post()
  @UseGuards(AccessGuard)
  @UseAbility(Actions.create, EmployerEntity)
  createEmployer(@AccountData() account: AccountEntity) {
    return this.employerService.createEmployer(account);
  }

  @Post(':employerId/verify')
  @UseGuards(AccessGuard)
  @UseAbility(Actions.manage, EmployerEntity)
  verifyEmployer(@Param('employerId', new ParseUUIDPipe()) employerId: string) {
    // TODO: Implement employer verification logic.
    return this.employerService.verifyEmployer(employerId);
  }
}
