import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MILLISECONDS_IN_DAY } from 'src/shared/consts/time.const';
import { FindOptionsWhere, In, Repository } from 'typeorm';

import {
  JobApplicationClientsCommand,
  JobApplicationEmployersCommand,
  JobApplicationStatus,
} from '../consts/job-application-status.const';
import { CreateJobApplicationDto } from '../dto/create-job-application.dto';
import { GetJobApplicationsDto } from '../dto/get-job-application.dto';
import { JobApplicationEntity } from '../entities/job-application.entity';
import { PositionService } from '../../position/services/position.service';

@Injectable()
export class JobApplicationService {
  constructor(
    @InjectRepository(JobApplicationEntity)
    private readonly jobApplicationRepository: Repository<JobApplicationEntity>,

    private readonly positionService: PositionService,
  ) {}

  async create(
    accountId: string,
    positionId: string,
    jobApplicationDto: CreateJobApplicationDto,
  ): Promise<JobApplicationEntity> {
    const position = await this.positionService.getActivePosition(positionId);

    const existedJobApplication = await this.jobApplicationRepository.findOne({
      where: {
        positionId,
        accountId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    if (existedJobApplication) {
      const diffsInMs = Math.abs(
        existedJobApplication.createdAt.getTime() - new Date().getTime(),
      );
      const diffsInDays = diffsInMs / MILLISECONDS_IN_DAY;

      if (diffsInDays > 30) {
        // TODO: custom error.
        throw new BadRequestException(
          'You have already submitted a job application for this position within the last 30 days.',
        );
      }
    }

    const jobApplicationData: Partial<JobApplicationEntity> = {
      accountId,
      positionId: position.id,
      resume: jobApplicationDto.resume,
      coverLetter: jobApplicationDto.coverLetter,
      conditions: jobApplicationDto.conditions,
      status: JobApplicationStatus.SUBMITTED,
    };
    const jobApplicationInst =
      this.jobApplicationRepository.create(jobApplicationData);

    const jobApplication =
      await this.jobApplicationRepository.save(jobApplicationInst);

    // TODO: Emit event that jobApplication is created.
    // TODO: Set cron-job that will reject (or something like that) too old job-applications.
    // TODO: Make sure that user can't send new job-applications if there is previous processing status job-application.

    return jobApplication;
  }

  async getJobApplication(
    jobApplicationId: string,
    accountId: string,
    employerId?: string,
  ): Promise<JobApplicationEntity> {
    const jobApplication = await this.jobApplicationRepository.findOneBy({
      id: jobApplicationId,
    });
    if (!jobApplication) {
      // TODO: handle error.
      throw new BadRequestException('Job application not found.');
    }

    if (jobApplication.accountId === accountId) {
      return jobApplication;
    }

    if (!employerId) {
      // TODO: handle error.
      throw new BadRequestException('Job application not found.');
    }

    try {
      const position = await this.positionService.getPosition(
        jobApplication.positionId,
      );
      if (position.employerId !== employerId) {
        // TODO: handle error.
        throw new BadRequestException('Job application not found.');
      }

      return jobApplication;
    } catch (err) {
      // TODO: handle error.
      throw new BadRequestException('Job application not found.');
    }
  }

  async getJobApplications(
    accountId: string,
    queryParams: GetJobApplicationsDto,
  ): Promise<JobApplicationEntity[]> {
    const whereParams: FindOptionsWhere<JobApplicationEntity> = {
      accountId,
      ...(queryParams.positionIds?.length && {
        positionId: In(queryParams.positionIds),
      }),
    };

    return this.jobApplicationRepository.find({
      order: { createdAt: 'DESC' },
      where: whereParams,
    });
  }

  async getEmployersJobApplications(
    employerId: string,
    positionId: string,
  ): Promise<JobApplicationEntity[]> {
    const position = await this.positionService.getPosition(positionId);
    if (position.employerId !== employerId) {
      // TODO: handle error.
      throw new BadRequestException('Position not found.');
    }

    return this.jobApplicationRepository.find({
      order: { createdAt: 'DESC' },
      where: { positionId: position.id },
    });
  }

  checkJoabApplicationClientCommand(
    command: JobApplicationClientsCommand,
    currStatus: JobApplicationStatus,
  ) {
    const commands: Record<
      JobApplicationClientsCommand,
      (status: JobApplicationStatus) => JobApplicationStatus
    > = {
      [JobApplicationClientsCommand.ACCEPT]: (status) => {
        if (status !== JobApplicationStatus.OFFER_EXTENDED) {
          throw new BadRequestException('Account should have offer.');
        }

        return JobApplicationStatus.ACCEPTED;
      },
      [JobApplicationClientsCommand.WITHDRAW]: (status) => {
        if (
          status === JobApplicationStatus.WITHDRAWN ||
          status === JobApplicationStatus.REJECTED ||
          status === JobApplicationStatus.ACCEPTED ||
          status === JobApplicationStatus.EXPIRED
        ) {
          // TODO: custom error.
          throw new BadRequestException(
            "Job Application shouldn't be already withdrawn or rejected, or accepted.",
          );
        }

        return JobApplicationStatus.WITHDRAWN;
      },
    };

    return commands[command](currStatus);
  }

  async updateClientJobApplicationStatus(
    accountId: string,
    jobApplicationId: string,
    command: JobApplicationClientsCommand,
  ): Promise<void> {
    const jobApplication = await this.jobApplicationRepository.findOneBy({
      id: jobApplicationId,
      accountId,
    });
    if (!jobApplication) {
      // TODO: handle error.
      throw new BadRequestException('Job application not found.');
    }

    // TODO: If withdrawn less than (5) minutes ago, so allow to undo this.

    const status = this.checkJoabApplicationClientCommand(
      command,
      jobApplication.status,
    );
    jobApplication.status = status;

    const updated = await this.jobApplicationRepository.update(
      jobApplication.id,
      {
        status,
      },
    );
    if (!updated.affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during updating Job Application.');
    }

    // TODO: emit event
  }

  checkJoabApplicationEmployerCommand(
    command: JobApplicationEmployersCommand,
    currStatus: JobApplicationStatus,
  ) {
    const commands: Record<
      JobApplicationEmployersCommand,
      (status: JobApplicationStatus) => JobApplicationStatus
    > = {
      [JobApplicationEmployersCommand.REJECT]: (status) => {
        if (
          status === JobApplicationStatus.REJECTED ||
          status === JobApplicationStatus.EXPIRED ||
          status === JobApplicationStatus.ACCEPTED ||
          status === JobApplicationStatus.WITHDRAWN
        ) {
          throw new BadRequestException(
            "Can't reject already rejected, expired, accepted or withdrawn job application.",
          );
        }
        return JobApplicationStatus.REJECTED;
      },
      [JobApplicationEmployersCommand.OFFER_EXTEND]: (status) => {
        if (
          status !== JobApplicationStatus.UNDER_REVIEW &&
          status !== JobApplicationStatus.SHORTLISTED &&
          status !== JobApplicationStatus.INTERVIEWING &&
          status !== JobApplicationStatus.ASSESSMENT
        ) {
          throw new BadRequestException(
            'Can make offer only for under review, shortlisted, interviewing, assessment job applications.',
          );
        }
        return JobApplicationStatus.REJECTED;
      },
      [JobApplicationEmployersCommand.REVIEW]: (status) => {
        if (
          status !== JobApplicationStatus.SHORTLISTED &&
          status !== JobApplicationStatus.INTERVIEWING &&
          status !== JobApplicationStatus.ASSESSMENT
        ) {
          throw new BadRequestException(
            'You can review only shortlisted, interviewed, assessment job applications.',
          );
        }
        return JobApplicationStatus.REJECTED;
      },
      [JobApplicationEmployersCommand.SHORTLIST]: (status) => {
        if (
          status !== JobApplicationStatus.UNDER_REVIEW &&
          status !== JobApplicationStatus.INTERVIEWING &&
          status !== JobApplicationStatus.ASSESSMENT
        ) {
          throw new BadRequestException(
            'You can review only under-review, interviewed, assessment job applications.',
          );
        }
        return JobApplicationStatus.REJECTED;
      },
      [JobApplicationEmployersCommand.INTERVIEW]: (status) => {
        if (
          status !== JobApplicationStatus.SHORTLISTED &&
          status !== JobApplicationStatus.UNDER_REVIEW &&
          status !== JobApplicationStatus.ASSESSMENT
        ) {
          throw new BadRequestException(
            'You can review only shortlisted, under-review, assessment job applications.',
          );
        }
        return JobApplicationStatus.REJECTED;
      },
      [JobApplicationEmployersCommand.EVALUATE]: (status) => {
        if (
          status !== JobApplicationStatus.SHORTLISTED &&
          status !== JobApplicationStatus.INTERVIEWING &&
          status !== JobApplicationStatus.UNDER_REVIEW
        ) {
          throw new BadRequestException(
            'You can review only shortlisted, interviewed, under-review job applications.',
          );
        }
        return JobApplicationStatus.REJECTED;
      },
    };

    return commands[command](currStatus);
  }

  async updateEmployerJobApplicationStatus(
    employerId: string,
    jobApplicationId: string,
    command: JobApplicationEmployersCommand,
  ): Promise<void> {
    const jobApplication = await this.jobApplicationRepository.findOneBy({
      id: jobApplicationId,
    });
    if (!jobApplication) {
      // TODO: handle error.
      throw new BadRequestException('Job application not found.');
    }

    const position = await this.positionService.getPosition(
      jobApplication.positionId,
    );
    if (position.employerId !== employerId) {
      // TODO: handle error.
      throw new BadRequestException('Position not found.');
    }

    const status = this.checkJoabApplicationEmployerCommand(
      command,
      jobApplication.status,
    );
    jobApplication.status = status;

    const updated = await this.jobApplicationRepository.update(
      jobApplication.id,
      {
        status,
      },
    );
    if (!updated.affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during updating Job Application.');
    }

    // TODO: emit event
  }
}
