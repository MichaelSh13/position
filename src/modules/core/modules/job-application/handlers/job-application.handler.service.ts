import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { HandleEvent } from 'src/modules/event-emitter-custom/decorators/handle-event.decorator';
import { EventEmitterService } from 'src/modules/event-emitter-custom/services/event-emitter-custom.service';
import { In, Repository } from 'typeorm';

import { AccountEvents } from '../../account/consts/account.event.const';
import { AccountBulkUpdatedActivityEvent } from '../../account/events/account-bulk-updated-activity.event';
import { AccountUpdatedActivityEvent } from '../../account/events/account-updated-activity.event';
import { ConversationService } from '../../conversation/services/conversation.service';
import { PositionEvents } from '../../position/consts/position.event.const';
import { PositionBulkUpdatedActivityEvent } from '../../position/events/position-bulk-updated-activity.event';
import { PositionUpdatedActivityEvent } from '../../position/events/position-updated-activity.event';
import { JobApplicationEvents } from '../consts/job-application.event.const';
import { JobApplicationEntity } from '../entities/job-application.entity';
import {
  JobApplicationBulkUpdatedActivityEvent,
  JobApplicationBulkUpdatedActivityEventPayload,
} from '../events/job-application-bulk-updated-activity.event';

@Injectable()
export class JobApplicationHandlerService {
  constructor(
    @InjectRepository(JobApplicationEntity)
    private readonly jobApplicationRepository: Repository<JobApplicationEntity>,

    private readonly conversationService: ConversationService,

    private readonly eventEmitterService: EventEmitterService,
  ) {}

  // TODO: Move to position service.
  private async updateJobApplications(
    jobApplications: JobApplicationEntity[],
    parentField: string,
    isParentActive: boolean,
  ): Promise<JobApplicationEntity[]> {
    if (!jobApplications.length) return [];

    const { affected } = await this.jobApplicationRepository.update(
      jobApplications.map(({ id }) => id),
      { [parentField]: isParentActive },
    );
    if (affected !== jobApplications.length) {
      // TODO: error
    }

    const result = jobApplications.map((position) => ({
      ...position,
      [parentField]: isParentActive,
    }));

    return result;
  }

  private async bulkJobApplicationUpdate(
    data: BulkJobApplicationUpdateData[],
    { idField, parentField }: BulkJobApplicationUpdateOptions,
  ) {
    if (!data.length) return;

    const ids = data.map(({ id }) => id);
    const eventParentsMap = Object.fromEntries(
      data.map((payload) => [payload.id, payload]),
    );

    const jobApplications = await this.jobApplicationRepository.findBy({
      [idField]: In(ids),
    });
    if (!jobApplications.length) {
      // TODO: Error
      return;
    }

    const availableJobApplications = jobApplications.filter(
      (jobApp) =>
        jobApp[parentField] !== eventParentsMap[jobApp.id].isParentActive,
    );

    const toActivateJobApplications: JobApplicationEntity[] =
      availableJobApplications.filter((jobApp) => !jobApp[parentField]);
    const toDeactivateJobApplications: JobApplicationEntity[] =
      availableJobApplications.filter((jobApp) => jobApp[parentField]);

    const [activatedJobApplications, deactivatedJobApplications] =
      await Promise.all([
        this.updateJobApplications(
          toActivateJobApplications,
          parentField,
          true,
        ),
        this.updateJobApplications(
          toDeactivateJobApplications,
          parentField,
          false,
        ),
      ]);
    const updatedJobApplications = [
      ...activatedJobApplications,
      ...deactivatedJobApplications,
    ];

    const payloadData: JobApplicationBulkUpdatedActivityEvent = {
      payloads:
        updatedJobApplications.map<JobApplicationBulkUpdatedActivityEventPayload>(
          (jobApplication) => ({
            jobApplicationId: jobApplication.id,
            positionId: jobApplication.positionId,
            isJobApplicationActive:
              JobApplicationEntity.isActive(jobApplication),
          }),
        ),
    };
    const payload = plainToInstance(
      JobApplicationBulkUpdatedActivityEvent,
      payloadData,
    );
    this.eventEmitterService.emit(
      JobApplicationEvents.BULK_UPDATED_ACTIVITY,
      payload,
    );
  }

  @HandleEvent(PositionEvents.BULK_UPDATED_ACTIVITY)
  async onPositionBulkUpdatedActivity({
    payloads,
  }: PositionBulkUpdatedActivityEvent) {
    const data: BulkJobApplicationUpdateData[] = payloads.map(
      ({ isPositionActive, positionId }) => ({
        id: positionId,
        isParentActive: isPositionActive,
      }),
    );

    await this.bulkJobApplicationUpdate(data, {
      idField: 'positionId',
      parentField: 'isPositionActive',
    });
  }

  @HandleEvent(PositionEvents.UPDATED_ACTIVITY)
  async onPositionUpdatedActivity({
    positionId,
    payload: { isPositionActive },
  }: PositionUpdatedActivityEvent) {
    const payload: BulkJobApplicationUpdateData = {
      id: positionId,
      isParentActive: isPositionActive,
    };

    await this.bulkJobApplicationUpdate([payload], {
      idField: 'positionId',
      parentField: 'isPositionActive',
    });
  }

  @HandleEvent(AccountEvents.BULK_UPDATED_ACTIVITY)
  async onAccountBulkUpdatedActivity({
    payloads,
  }: AccountBulkUpdatedActivityEvent) {
    const data: BulkJobApplicationUpdateData[] = payloads.map(
      ({ accountId, isAccountActive }) => ({
        id: accountId,
        isParentActive: isAccountActive,
      }),
    );

    await this.bulkJobApplicationUpdate(data, {
      idField: 'accountId',
      parentField: 'isAccountActive',
    });
  }

  @HandleEvent(AccountEvents.UPDATED_ACTIVITY)
  async onAccountUpdatedActivity({
    accountId,
    payload: { isAccountActive },
  }: AccountUpdatedActivityEvent) {
    const payload: BulkJobApplicationUpdateData = {
      id: accountId,
      isParentActive: isAccountActive,
    };

    await this.bulkJobApplicationUpdate([payload], {
      idField: 'accountId',
      parentField: 'isAccountActive',
    });
  }
}
