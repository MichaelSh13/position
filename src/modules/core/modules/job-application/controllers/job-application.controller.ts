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
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AccessGuard, UseAbility } from 'nest-casl';
import { AccountData } from 'src/modules/auth/decorators/account-data.decorator';

import {
  JobApplicationClientsCommand,
  JobApplicationEmployersCommand,
} from '../consts/job-application-status.const';
import { CreateJobApplicationDto } from '../dto/create-job-application.dto';
import { GetJobApplicationsDto } from '../dto/get-job-application.dto';
import { JobApplicationEntity } from '../entities/job-application.entity';
import { JobApplicationActions } from '../job-application.permission';
import { JobApplicationService } from '../services/job-application.service';
import { AccountEntity } from '../../account/entities/account.entity';

@ApiTags('Job Application')
@ApiSecurity('JWT-auth')
@Controller('')
export class JobApplicationController {
  constructor(private readonly jobApplicationService: JobApplicationService) {}

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
  @Get('job-application')
  @UseGuards(AccessGuard)
  @UseAbility(JobApplicationActions.CLIENT_READ, JobApplicationEntity)
  getJobApplications(
    @AccountData() account: AccountEntity,
    @Query() queryParams: GetJobApplicationsDto,
  ): Promise<JobApplicationEntity[]> {
    return this.jobApplicationService.getJobApplications(
      account.id,
      queryParams,
    );
  }

  @Get('employer/position/:positionId/job-application')
  @UseGuards(AccessGuard)
  @UseAbility(JobApplicationActions.EMPLOYER_READ, JobApplicationEntity)
  getEmployersJobApplications(
    @AccountData() account: AccountEntityWithEmployer,
    @Param('positionId', new ParseUUIDPipe()) positionId: string,
  ): Promise<JobApplicationEntity[]> {
    return this.jobApplicationService.getEmployersJobApplications(
      account.employerId,
      positionId,
    );
  }

  @Post('position/:positionId/job-application')
  @UseGuards(AccessGuard)
  @UseAbility(JobApplicationActions.CREATE, JobApplicationEntity)
  createJobApplication(
    @Param('positionId', new ParseUUIDPipe()) positionId: string,
    @AccountData() account: AccountEntity,
    @Body() jobApplicationDto: CreateJobApplicationDto,
  ): Promise<JobApplicationEntity> {
    return this.jobApplicationService.create(
      account.id,
      positionId,
      jobApplicationDto,
    );
  }

  @Patch('client/job-application/:jobApplicationId/:command')
  @HttpCode(204)
  @UseGuards(AccessGuard)
  @UseAbility(JobApplicationActions.CLIENT_MANAGE, JobApplicationEntity)
  updateClientJobApplicationStatus(
    @Param('jobApplicationId', new ParseUUIDPipe()) jobApplicationId: string,
    @Param('command', new ParseEnumPipe(JobApplicationClientsCommand))
    command: JobApplicationClientsCommand,
    @AccountData() account: AccountEntity,
  ): Promise<void> {
    return this.jobApplicationService.updateClientJobApplicationStatus(
      account.id,
      jobApplicationId,
      command,
    );
  }

  @Patch('employer/job-application/:jobApplicationId/:status')
  @HttpCode(204)
  @UseGuards(AccessGuard)
  @UseAbility(JobApplicationActions.EMPLOYER_MANAGE, JobApplicationEntity)
  updateEmployerJobApplicationStatus(
    @Param('jobApplicationId', new ParseUUIDPipe()) jobApplicationId: string,
    @Param('command', new ParseEnumPipe(JobApplicationEmployersCommand))
    command: JobApplicationEmployersCommand,
    @AccountData() account: AccountEntityWithEmployer,
  ): Promise<void> {
    return this.jobApplicationService.updateEmployerJobApplicationStatus(
      account.employerId,
      jobApplicationId,
      command,
    );
  }
}
