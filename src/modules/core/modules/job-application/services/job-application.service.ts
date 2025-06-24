import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { EventEmitterService } from 'src/modules/event-emitter-custom/services/event-emitter-custom.service';
import { MS_IN_DAY } from 'src/shared/consts/time.const';
import { DeepPartial, FindOptionsWhere, In, Repository } from 'typeorm';

import { PositionService } from '../../position/services/position.service';
import { JobApplicationEvents } from '../consts/job-application.event.const';
import { JobApplicationClientStatus } from '../consts/job-application-client-status.const';
import { JobApplicationSystemStatus } from '../consts/job-application-system-status.const';
import { JobApplicationUserStatus } from '../consts/job-application-user-status.const';
import { MIN_DAYS_BEFORE_SEND_JOB_APPLICATION } from '../consts/min-dats-before-send-job-application.const';
import { CreateJobApplicationDto } from '../dto/create-job-application.dto';
import { GetJobApplicationsDto } from '../dto/get-job-application.dto';
import { JobApplicationEntity } from '../entities/job-application.entity';
import { JobApplicationCreatedEvent } from '../events/job-application-created.event';
import { JobApplicationUpdatedClientStatusEvent } from '../events/job-application-updated-client-status.event';
import { JobApplicationUpdatedSystemStatusEvent } from '../events/job-application-updated-system-status.event';
import { JobApplicationUpdatedUserStatusEvent } from '../events/job-application-updated-user-status.event';

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
    employerId?: string,
  ): Promise<JobApplicationEntity> {
    const position = await this.positionService.getActivePosition(positionId);
    if (position.employerId === employerId) {
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

      if (JobApplicationEntity.isActive(existedJobApplication)) {
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

    const jobApplicationData: DeepPartial<JobApplicationEntity> = {
      accountId,
      positionId: position.id,
      resume: jobApplicationDto.resume,
      coverLetter: jobApplicationDto.coverLetter,
      conditions: jobApplicationDto.conditions,
      conversation: {},
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
    accountId?: string,
    employerId?: string,
  ): Promise<JobApplicationEntity> {
    try {
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
        throw new BadRequestException(
          'You are not owner of position of this job-application.',
        );
      }

      const position = await this.positionService.getPosition(
        jobApplication.positionId,
      );
      if (position.employerId !== employerId) {
        // TODO: handle error.
        throw new BadRequestException(
          'You are not owner of position of this job-application.',
        );
      }

      return jobApplication;
    } catch (err) {
      // TODO: handle error.
      throw new BadRequestException('Job application not found.');
    }
  }

  async getJobApplicationsSended(
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

  async getEmployerJobApplications(
    employerId: string,
  ): Promise<JobApplicationEntity[]> {
    const jobApplications = await this.jobApplicationRepository.find({
      order: { createdAt: 'DESC' },
      where: {
        position: {
          employerId,
        },
      },
      relations: {
        position: true,
      },
    });

    console.log(jobApplications);
    console.log(jobApplications.length);

    return jobApplications;
  }

  async getPositionJobApplications(
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

  async changeClientStatus(
    employerId: string,
    jobApplicationId: string,
    clientStatus: JobApplicationClientStatus,
  ): Promise<void> {
    const jobApplication = await this.getJobApplication(
      jobApplicationId,
      undefined,
      employerId,
    );
    if (jobApplication.clientStatus === clientStatus) {
      throw new BadRequestException(
        `Job-application is already ${clientStatus}.`,
      );
    }

    const updated = await this.jobApplicationRepository.update(
      jobApplication.id,
      {
        clientStatus,
      },
    );
    if (!updated.affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during updating Job Application.');
    }

    const updatedEmployer: JobApplicationEntity = {
      ...jobApplication,
      clientStatus,
    };
    const wasJobApplicationActive =
      JobApplicationEntity.isActive(jobApplication);
    const isJobApplicationActive =
      JobApplicationEntity.isActive(updatedEmployer);

    const payloadData: JobApplicationUpdatedClientStatusEvent = {
      jobApplicationId: jobApplication.id,
      payload: {
        clientStatus,
        isJobApplicationActive,
        wasJobApplicationActivityChanged:
          wasJobApplicationActive === isJobApplicationActive,
      },
    };
    const payload: JobApplicationUpdatedClientStatusEvent = plainToInstance(
      JobApplicationUpdatedClientStatusEvent,
      payloadData,
    );
    this.eventEmitterService.emit(
      JobApplicationEvents.UPDATED_CLIENT_STATUS,
      payload,
    );
  }

  async changeSystemStatus(
    jobApplicationId: string,
    systemStatus: JobApplicationSystemStatus,
  ): Promise<void> {
    const jobApplication = await this.jobApplicationRepository.findOneBy({
      id: jobApplicationId,
    });
    if (!jobApplication) {
      throw new BadRequestException('Job application not found.');
    }
    if (jobApplication.systemStatus === systemStatus) {
      throw new BadRequestException(
        `Job-application is already ${systemStatus}.`,
      );
    }

    const { affected } = await this.jobApplicationRepository.update(
      jobApplicationId,
      {
        systemStatus,
      },
    );
    if (!affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during updating position.');
    }

    const updatedJobApplication: JobApplicationEntity = {
      ...jobApplication,
      systemStatus,
    };

    const wasJobApplicationActive =
      JobApplicationEntity.isActive(jobApplication);
    const isJobApplicationActive = JobApplicationEntity.isActive(
      updatedJobApplication,
    );

    const changedStatusPayloadData: JobApplicationUpdatedSystemStatusEvent = {
      jobApplicationId: jobApplication.id,
      payload: {
        systemStatus,
        isJobApplicationActive,
        wasJobApplicationActivityChanged:
          wasJobApplicationActive === isJobApplicationActive,
      },
    };
    const changedStatusPayload = plainToInstance(
      JobApplicationUpdatedSystemStatusEvent,
      changedStatusPayloadData,
    );
    this.eventEmitterService.emit(
      JobApplicationEvents.UPDATED_SYSTEM_STATUS,
      changedStatusPayload,
    );
  }

  async changeUserStatus(
    accountId: string,
    jobApplicationId: string,
    userStatus: JobApplicationUserStatus,
  ): Promise<void> {
    const jobApplication = await this.getJobApplication(
      jobApplicationId,
      accountId,
    );
    if (jobApplication.userStatus === userStatus) {
      throw new BadRequestException(
        `Job-application is already ${userStatus}.`,
      );
    }

    const { affected } = await this.jobApplicationRepository.update(
      jobApplication.id,
      {
        userStatus,
      },
    );
    if (!affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during updating Job Application.');
    }

    const updatedEmployer: JobApplicationEntity = {
      ...jobApplication,
      userStatus,
    };
    const wasJobApplicationActive =
      JobApplicationEntity.isActive(jobApplication);
    const isJobApplicationActive =
      JobApplicationEntity.isActive(updatedEmployer);

    const payloadData: JobApplicationUpdatedUserStatusEvent = {
      jobApplicationId: jobApplication.id,
      payload: {
        userStatus,
        isJobApplicationActive,
        wasJobApplicationActivityChanged:
          wasJobApplicationActive === isJobApplicationActive,
      },
    };
    const payload: JobApplicationUpdatedUserStatusEvent = plainToInstance(
      JobApplicationUpdatedUserStatusEvent,
      payloadData,
    );
    this.eventEmitterService.emit(
      JobApplicationEvents.UPDATED_USER_STATUS,
      payload,
    );
  }
}
