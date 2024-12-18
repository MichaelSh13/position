import {
  Body,
  Controller,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AccessGuard, Actions, UseAbility } from 'nest-casl';
import { AccountData } from 'src/modules/auth/decorators/account-data.decorator';

import { EmployerSystemStatus } from '../consts/employer-system-status.const';
import { EmployerUserStatus } from '../consts/employer-user-status.const';
import { CreateEmployerDto } from '../dto/create-employer.dto';
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
  createEmployer(
    @Body() createEmployerData: CreateEmployerDto,
    @AccountData() account: AccountEntity,
  ) {
    return this.employerService.createEmployer(account, createEmployerData);
  }

  @Patch('user-status/:userStatus')
  @UseGuards(AccessGuard)
  @UseAbility(Actions.update, EmployerEntity)
  changeEmployerUserStatus(
    @Param('userStatus', new ParseEnumPipe(EmployerUserStatus))
    userStatus: EmployerUserStatus,
    @AccountData() { employer }: AccountEntityWithEmployer,
  ): Promise<void> {
    return this.employerService.changeEmployerUserStatus(employer, userStatus);
  }

  @Post(':employerId/system-status/:systemStatus')
  @UseGuards(AccessGuard)
  @UseAbility(Actions.manage, EmployerEntity)
  changeEmployerSystemStatus(
    @Param('employerId', new ParseUUIDPipe()) employerId: string,
    @Param('systemStatus', new ParseEnumPipe(EmployerSystemStatus))
    systemStatus: EmployerSystemStatus,
    @AccountData() admin: AccountEntity,
  ): Promise<void> {
    return this.employerService.changeEmployerSystemStatus(
      employerId,
      systemStatus,
      admin.id,
    );
  }
}
