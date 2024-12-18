import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { EventEmitterService } from 'src/modules/event-emitter-custom/services/event-emitter-custom.service';
import { MS_IN_DAY } from 'src/shared/consts/time.const';
import { FindOptionsWhere, In, Repository } from 'typeorm';

import { PositionService } from '../../position/services/position.service';
import { JobApplicationEvents } from '../consts/job-application.event.const';
import {
  JobApplicationClientsCommand,
  JobApplicationEmployersCommand,
  JobApplicationStatus,
} from '../consts/job-application-status.const';
import { MIN_DAYS_BEFORE_SEND_JOB_APPLICATION } from '../consts/min-dats-before-send-job-application.const';
import { CreateJobApplicationDto } from '../dto/create-job-application.dto';
import { GetJobApplicationsDto } from '../dto/get-job-application.dto';
import { JobApplicationEntity } from '../entities/job-application.entity';
import { JobApplicationChangedStatusEvent } from '../events/job-application-changed-status.event';
import { JobApplicationCreatedEvent } from '../events/job-application-created.event';

@Injectable()
export class JobApplicationService {
  constructor(
    @InjectRepository(JobApplicationEntity)
    private readonly jobApplicationRepository: Repository<JobApplicationEntity>,

    private readonly positionService: PositionService,
    private readonly eventEmitterService: EventEmitterService,
  ) {}

  async create(
    accountId: string,
    positionId: string,
    jobApplicationDto: CreateJobApplicationDto,
  ): Promise<JobApplicationEntity> {
    const position = await this.positionService.getActivePosition(positionId);
    if (position.id === accountId) {
      // TODO: Use custom exception.
      throw new BadRequestException('You cannot apply for your own position.');
    }

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
      // TODO: Use some utils or time library.
      const diffsInMs = Math.abs(
        existedJobApplication.createdAt.getTime() - new Date().getTime(),
      );
      const diffsInDays = diffsInMs / MS_IN_DAY;

      if (!JobApplicationEntity.isClose(existedJobApplication.status)) {
        // TODO: error
        throw new BadRequestException(
          'You already have active job application for this position.',
        );
      }

      if (diffsInDays > MIN_DAYS_BEFORE_SEND_JOB_APPLICATION) {
        // TODO: custom error.
        throw new BadRequestException(
          `You have already submitted a job application for this position within the last ${MIN_DAYS_BEFORE_SEND_JOB_APPLICATION} days.`,
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

    const createdPayloadData: JobApplicationCreatedEvent = {
      jobApplicationId: jobApplication.id,
      payload: {
        jobApplication,
      },
    };
    const createdPayload = plainToInstance(
      JobApplicationCreatedEvent,
      createdPayloadData,
    );
    this.eventEmitterService.emit(JobApplicationEvents.CREATED, createdPayload);

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

  // TODO!: Create active status list and not-active. Use it for getting only active, or not positions.

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

  private checkJobApplicationClientCommand(
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

    const status = this.checkJobApplicationClientCommand(
      command,
      jobApplication.status,
    );
    jobApplication.status = status;

    const { affected } = await this.jobApplicationRepository.update(
      jobApplication.id,
      {
        status: jobApplication.status,
      },
    );
    if (!affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during updating Job Application.');
    }

    // Emit events
    const changedStatusPayloadData: JobApplicationChangedStatusEvent = {
      jobApplicationId: jobApplication.id,
      payload: {
        jobApplication,
      },
    };
    const changedStatusPayload = plainToInstance(
      JobApplicationChangedStatusEvent,
      changedStatusPayloadData,
    );
    this.eventEmitterService.emit(
      JobApplicationEvents.CHANGED_STATUS,
      changedStatusPayload,
    );

    const updatedPayloadData: JobApplicationCreatedEvent = {
      jobApplicationId: jobApplication.id,
      payload: {
        jobApplication,
      },
    };
    const updatedPayload = plainToInstance(
      JobApplicationCreatedEvent,
      updatedPayloadData,
    );
    this.eventEmitterService.emit(JobApplicationEvents.UPDATED, updatedPayload);
  }

  private checkJobApplicationEmployerCommand(
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

    const status = this.checkJobApplicationEmployerCommand(
      command,
      jobApplication.status,
    );
    jobApplication.status = status;

    const updated = await this.jobApplicationRepository.update(
      jobApplication.id,
      {
        status: jobApplication.status,
      },
    );
    if (!updated.affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during updating Job Application.');
    }

    const changedStatusPayloadData: JobApplicationChangedStatusEvent = {
      jobApplicationId: jobApplication.id,
      payload: {
        jobApplication,
      },
    };
    const changedStatusPayload = plainToInstance(
      JobApplicationChangedStatusEvent,
      changedStatusPayloadData,
    );
    this.eventEmitterService.emit(
      JobApplicationEvents.CHANGED_STATUS,
      changedStatusPayload,
    );

    const updatedPayloadData: JobApplicationCreatedEvent = {
      jobApplicationId: jobApplication.id,
      payload: {
        jobApplication,
      },
    };
    const updatedPayload = plainToInstance(
      JobApplicationCreatedEvent,
      updatedPayloadData,
    );
    this.eventEmitterService.emit(JobApplicationEvents.UPDATED, updatedPayload);
  }
}
