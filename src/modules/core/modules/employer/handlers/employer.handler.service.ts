import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { HandleEvent } from 'src/modules/event-emitter-custom/decorators/handle-event.decorator';
import { EventEmitterService } from 'src/modules/event-emitter-custom/services/event-emitter-custom.service';
import { In, Repository } from 'typeorm';

import { AccountEvents } from '../../account/consts/account.event.const';
import { AccountBulkUpdatedActivityEvent } from '../../account/events/account-bulk-updated-activity.event';
import { AccountUpdatedActivityEvent } from '../../account/events/account-updated-activity.event';
import { EmployerEvents } from '../consts/employer.event.const';
import { EmployerEntity } from '../entities/employer.entity';
import {
  EmployerBulkUpdatedActivityEvent,
  EmployerBulkUpdatedActivityEventPayload,
} from '../events/employer-bulk-updated-activity.event';
import { EmployerBulkUpdatedSystemStatusEvent } from '../events/employer-bulk-updated-system-status.event';
import { EmployerUpdatedActivityEvent } from '../events/employer-updated-activity.event';
import { EmployerUpdatedSystemStatusEvent } from '../events/employer-updated-system-status.event';
import { EmployerUpdatedUserStatusEvent } from '../events/employer-updated-user-status.event';
import { EmployerService } from '../services/employer.service';

@Injectable()
export class EmployerHandlerService {
  constructor(
    @InjectRepository(EmployerEntity)
    private readonly employerRepository: Repository<EmployerEntity>,
    private readonly employerService: EmployerService,

    private readonly eventEmitterService: EventEmitterService,
  ) {}

  // TODO: Move to employer service
  private async updateEmployers(
    employers: EmployerEntity[],
    isParentActive: boolean,
  ): Promise<EmployerEntity[]> {
    if (!employers.length) return [];

    const { affected } = await this.employerRepository.update(
      employers.map(({ id }) => id),
      { isParentActive },
    );
    if (affected !== employers.length) {
      // TODO: error
    }

    const result = employers.map((employer) => ({
      ...employer,
      isParentActive,
    }));

    return result;
  }

  @HandleEvent(AccountEvents.BULK_UPDATED_ACTIVITY)
  async onAccountBulkUpdatedActivity({
    payloads,
  }: AccountBulkUpdatedActivityEvent) {
    const eventPayloads = payloads.filter(({ employerId }) => employerId);
    if (!eventPayloads.length) return;

    const eventEmployersMap: Record<string, boolean> = {};
    for (const { employerId, isAccountActive } of eventPayloads) {
      eventEmployersMap[employerId!] = isAccountActive;
    }

    const allEmployersToUpdate = await this.employerRepository.findBy({
      id: In(Object.keys(eventEmployersMap)),
    });
    if (eventPayloads.length !== allEmployersToUpdate.length) {
      // TODO: Log data

      if (!allEmployersToUpdate.length) {
        // TODO: Error
        return;
      }
    }

    const toActivateEmployers: EmployerEntity[] = [];
    const toDeactivateEmployers: EmployerEntity[] = [];
    for (const emp of allEmployersToUpdate) {
      if (emp.isParentActive === eventEmployersMap[emp.id]) continue;

      if (emp.isParentActive) {
        toDeactivateEmployers.push(emp);
        continue;
      }

      toActivateEmployers.push(emp);
    }

    const [activatedEmployers, deactivatedEmployers] = await Promise.all([
      this.updateEmployers(toActivateEmployers, true),
      this.updateEmployers(toDeactivateEmployers, false),
    ]);
    const updatedEmployers = [...activatedEmployers, ...deactivatedEmployers];

    const payloadData: EmployerBulkUpdatedActivityEvent = {
      payloads: updatedEmployers.map<EmployerBulkUpdatedActivityEventPayload>(
        (employer) => ({
          accountId: employer.accountId,
          employerId: employer.id,
          isEmployerActive: EmployerEntity.isActive(employer, {
            verification: false,
          }),
        }),
      ),
    };
    const payload = plainToInstance(
      EmployerBulkUpdatedActivityEvent,
      payloadData,
    );
    this.eventEmitterService.emit(
      EmployerEvents.BULK_UPDATED_ACTIVITY,
      payload,
    );
  }

  @HandleEvent(AccountEvents.UPDATED_ACTIVITY)
  async onAccountUpdatedActivity({
    accountId,
    payload: { employerId, isAccountActive },
  }: AccountUpdatedActivityEvent) {
    if (!employerId) return;

    const employerToUpdate = await this.employerRepository.findOneBy({
      id: employerId,
      isParentActive: !isAccountActive,
    });
    if (!employerToUpdate) return;

    const { affected } = await this.employerRepository.update(
      employerToUpdate.id,
      { isParentActive: isAccountActive },
    );
    if (!affected) {
      // TODO: error
      throw new Error('Error during updating employer.');
    }
    const employer: EmployerEntity = {
      ...employerToUpdate,
      isParentActive: isAccountActive,
    };

    const eventData: EmployerUpdatedActivityEvent = {
      employerId: employer.id,
      payload: {
        accountId,
        isEmployerActive: EmployerEntity.isActive(employer, {
          verification: false,
        }),
      },
    };
    const eventInst = plainToInstance(EmployerUpdatedActivityEvent, eventData);
    this.eventEmitterService.emit(EmployerEvents.UPDATED_ACTIVITY, eventInst);
  }

  @HandleEvent(EmployerEvents.UPDATED_SYSTEM_STATUS)
  onEmployerUpdatedSystemStatus({
    employerId,
    payload: { accountId, isEmployerActive, wasEmployerActivityChanged },
  }: EmployerUpdatedSystemStatusEvent) {
    if (!wasEmployerActivityChanged) return;

    const eventData: EmployerUpdatedActivityEvent = {
      employerId,
      payload: { isEmployerActive, accountId },
    };
    const eventInst = plainToInstance(EmployerUpdatedActivityEvent, eventData);
    this.eventEmitterService.emit(EmployerEvents.UPDATED_ACTIVITY, eventInst);
  }

  @HandleEvent(EmployerEvents.UPDATED_USER_STATUS)
  onEmployerUpdatedUserStatus({
    employerId,
    payload: { accountId, isEmployerActive, wasEmployerActivityChanged },
  }: EmployerUpdatedUserStatusEvent) {
    if (!wasEmployerActivityChanged) return;

    const eventData: EmployerUpdatedActivityEvent = {
      employerId,
      payload: { isEmployerActive, accountId },
    };
    const eventInst = plainToInstance(EmployerUpdatedActivityEvent, eventData);
    this.eventEmitterService.emit(EmployerEvents.UPDATED_ACTIVITY, eventInst);
  }

  @HandleEvent(EmployerEvents.BULK_UPDATED_SYSTEM_STATUS)
  onEmployerBulkUpdatedSystemStatus({
    payloads,
  }: EmployerBulkUpdatedSystemStatusEvent) {
    const data = payloads.filter(
      ({ wasEmployerActivityChanged }) => wasEmployerActivityChanged,
    );

    const eventData: EmployerBulkUpdatedActivityEvent = {
      payloads: data.map<EmployerBulkUpdatedActivityEventPayload>(
        ({ accountId, isEmployerActive, employerId }) => ({
          accountId,
          employerId,
          isEmployerActive,
        }),
      ),
    };
    const eventInst = plainToInstance(
      EmployerBulkUpdatedActivityEvent,
      eventData,
    );
    this.eventEmitterService.emit(
      EmployerEvents.BULK_UPDATED_ACTIVITY,
      eventInst,
    );
  }
}
