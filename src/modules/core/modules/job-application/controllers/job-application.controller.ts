import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AccessGuard, UseAbility } from 'nest-casl';
import { AccountData } from 'src/modules/auth/decorators/account-data.decorator';

import { AccountEntity } from '../../account/entities/account.entity';
import { JobApplicationClientStatus } from '../consts/job-application-client-status.const';
import { JobApplicationSystemStatus } from '../consts/job-application-system-status.const';
import { JobApplicationUserStatus } from '../consts/job-application-user-status.const';
import { CreateJobApplicationDto } from '../dto/create-job-application.dto';
import { GetJobApplicationsDto } from '../dto/get-job-application.dto';
import { JobApplicationEntity } from '../entities/job-application.entity';
import { JobApplicationActions } from '../job-application.permission';
import { JobApplicationService } from '../services/job-application.service';

@ApiTags('Job Application')
@ApiSecurity('JWT-auth')
@Controller('')
export class JobApplicationController {
  constructor(private readonly jobApplicationService: JobApplicationService) {}

  @Get('job-application/sended')
  @UseGuards(AccessGuard)
  @UseAbility(JobApplicationActions.CLIENT_READ, JobApplicationEntity)
  getJobApplicationsSended(
    @AccountData() account: AccountEntity,
    @Query() queryParams: GetJobApplicationsDto,
  ): Promise<JobApplicationEntity[]> {
    return this.jobApplicationService.getJobApplicationsSended(
      account.id,
      queryParams,
    );
  }

  @Get('employer/job-application')
  @UseGuards(AccessGuard)
  @UseAbility(JobApplicationActions.EMPLOYER_READ, JobApplicationEntity)
  getEmployerJobApplications(
    @AccountData() account: AccountEntityWithEmployer,
  ): Promise<JobApplicationEntity[]> {
    return this.jobApplicationService.getEmployerJobApplications(
      account.employerId,
    );
  }

  @Get('job-application/:jobApplicationId')
  @UseGuards(AccessGuard)
  @UseAbility(JobApplicationActions.READ, JobApplicationEntity)
  getJobApplication(
    @Param('jobApplicationId', new ParseUUIDPipe()) jobApplicationId: string,
    @AccountData() account: AccountEntity,
  ): Promise<JobApplicationEntity> {
    return this.jobApplicationService.getJobApplication(
      jobApplicationId,
      account.id,
      account.employerId,
    );
  }

  @Post('position/:positionId/job-application')
  @UseGuards(AccessGuard)
  @UseAbility(JobApplicationActions.CREATE, JobApplicationEntity)
  @ApiResponse({ type: JobApplicationEntity })
  createJobApplication(
    @Param('positionId', new ParseUUIDPipe()) positionId: string,
    @AccountData() account: AccountEntity,
    @Body() jobApplicationDto: CreateJobApplicationDto,
  ): Promise<JobApplicationEntity> {
    return this.jobApplicationService.create(
      account.id,
      positionId,
      jobApplicationDto,
      account.employerId,
    );
  }

  @Patch('job-application/:jobApplicationId/system-status/:systemStatus')
  @HttpCode(204)
  @UseGuards(AccessGuard)
  @UseAbility(JobApplicationActions.MANAGE, JobApplicationEntity)
  changeSystemStatus(
    @Param('jobApplicationId', new ParseUUIDPipe()) jobApplicationId: string,
    @Param('systemStatus', new ParseEnumPipe(JobApplicationSystemStatus))
    systemStatus: JobApplicationSystemStatus,
  ): Promise<void> {
    return this.jobApplicationService.changeSystemStatus(
      jobApplicationId,
      systemStatus,
    );
  }

  @Patch('user/job-application/:jobApplicationId/user-status/:userStatus')
  @HttpCode(204)
  @UseGuards(AccessGuard)
  @UseAbility(JobApplicationActions.CLIENT_MANAGE, JobApplicationEntity)
  changeUserStatus(
    @Param('jobApplicationId', new ParseUUIDPipe()) jobApplicationId: string,
    @Param('userStatus', new ParseEnumPipe(JobApplicationUserStatus))
    userStatus: JobApplicationUserStatus,
    @AccountData() account: AccountEntity,
  ): Promise<void> {
    return this.jobApplicationService.changeUserStatus(
      account.id,
      jobApplicationId,
      userStatus,
    );
  }

  @Patch(
    'employer/job-application/:jobApplicationId/client-status/:clientStatus',
  )
  @HttpCode(204)
  @UseGuards(AccessGuard)
  @UseAbility(JobApplicationActions.EMPLOYER_MANAGE, JobApplicationEntity)
  changeClientStatus(
    @Param('jobApplicationId', new ParseUUIDPipe()) jobApplicationId: string,
    @Param('clientStatus', new ParseEnumPipe(JobApplicationClientStatus))
    clientStatus: JobApplicationClientStatus,
    @AccountData() account: AccountEntityWithEmployer,
  ): Promise<void> {
    return this.jobApplicationService.changeClientStatus(
      account.employerId,
      jobApplicationId,
      clientStatus,
    );
  }
}
