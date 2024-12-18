import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { MS_IN_DAY } from 'src/shared/consts/time.const';
import { In, Not, Repository } from 'typeorm';

import {
  closeJobApplicationStatuses,
  JobApplicationStatus,
} from '../consts/job-application-status.const';
import { MIN_DAYS_BEFORE_SEND_JOB_APPLICATION } from '../consts/min-dats-before-send-job-application.const';
import { JobApplicationEntity } from '../entities/job-application.entity';

@Injectable()
export class JobApplicationJobService {
  constructor(
    @InjectRepository(JobApplicationEntity)
    private readonly jobApplicationRepository: Repository<JobApplicationEntity>,
  ) {}

  @Cron('* */2 * * *')
  async handleCron() {
    // TODO: Better to do it partially, to not have performance issues.
    const jobApplications = await this.jobApplicationRepository.findBy({
      status: Not(In(closeJobApplicationStatuses)),
    });

    const stillActiveJobApplicationIds = jobApplications
      .filter(({ createdAt }) => {
        // TODO: Use some utils or time library.
        const diffsInMs = Math.abs(createdAt.getTime() - new Date().getTime());
        const diffsInDays = diffsInMs / MS_IN_DAY;

        return diffsInDays >= MIN_DAYS_BEFORE_SEND_JOB_APPLICATION;
      })
      .map(({ id }) => id);

    const { affected } = await this.jobApplicationRepository.update(
      stillActiveJobApplicationIds,
      {
        status: JobApplicationStatus.EXPIRED,
      },
    );
    if (affected !== stillActiveJobApplicationIds.length) {
      // TODO: Logger it.
      console.log(
        `Expired ${affected} job applications. Only ${stillActiveJobApplicationIds.length} were still active.`,
      );
    }
  }
}
