import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { HandleEvent } from 'src/modules/event-emitter-custom/decorators/handle-event.decorator';
import { EventEmitterService } from 'src/modules/event-emitter-custom/services/event-emitter-custom.service';
import { AccountRoles } from 'src/modules/permission/consts/permission.const';
import { Repository } from 'typeorm';

import { EmployerEvents } from '../../employer/consts/employer.event.const';
import { EmployerCreatedEvent } from '../../employer/events/employer-created.event';
import { AccountEvents } from '../consts/account.event.const';
import { AccountEntity } from '../entities/account.entity';
import {
  AccountBulkUpdatedActivityEvent,
  AccountBulkUpdatedActivityEventPayload,
} from '../events/account-bulk-updated-activity.event';
import { AccountBulkUpdatedSystemStatusEvent } from '../events/account-bulk-updated-system-status.event';
import { AccountChangedRoleEvent } from '../events/account-changed-role.event';
import { AccountUpdatedActivityEvent } from '../events/account-updated-activity.event';
import { AccountUpdatedSystemStatusEvent } from '../events/account-updated-system-status.event';
import { AccountUpdatedUserStatusEvent } from '../events/account-updated-user-status.event';
import { AccountService } from '../services/account.service';

@Injectable()
export class AccountHandlerService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    private readonly accountService: AccountService,

    private readonly eventEmitterService: EventEmitterService,
  ) {}

  @HandleEvent(EmployerEvents.CREATED)
  async handleEmployerCreated({
    employerId,
    payload: { accountId },
  }: EmployerCreatedEvent) {
    const account = await this.accountService.getAccount({
      id: accountId,
      employerId,
    });

    if (account.roles.includes(AccountRoles.EMPLOYER)) {
      // TODO: Logger it.
      return;
    }

    // TODO: Do not keep logic and sending other events in handlers, only in services.
    // TODO?: You can keep there checking: e.g. code above.
    account.roles = [...new Set([...account.roles, AccountRoles.EMPLOYER])];
    const { affected } = await this.accountRepository.update(account.id, {
      roles: account.roles,
    });
    if (!affected) {
      // TODO: error;
      throw new Error('Account role not updated.');
    }

    const payloadData: AccountChangedRoleEvent = {
      accountId: account.id,
    };
    const payload = plainToInstance(AccountChangedRoleEvent, payloadData);
    this.eventEmitterService.emit(AccountEvents.UPDATED_ROLE, payload);
  }

  @HandleEvent(AccountEvents.UPDATED_SYSTEM_STATUS)
  onAccountUpdatedSystemStatus({
    accountId,
    payload: { isAccountActive, employerId, wasAccountActivityChanged },
  }: AccountUpdatedSystemStatusEvent) {
    if (!wasAccountActivityChanged) return;

    const eventData: AccountUpdatedActivityEvent = {
      accountId,
      payload: { isAccountActive, employerId },
    };
    const eventInst = plainToInstance(AccountUpdatedActivityEvent, eventData);
    this.eventEmitterService.emit(AccountEvents.UPDATED_ACTIVITY, eventInst);
  }
  @HandleEvent(AccountEvents.UPDATED_USER_STATUS)
  onAccountUpdatedUserStatus({
    accountId,
    payload: { isAccountActive, employerId, wasAccountActivityChanged },
  }: AccountUpdatedUserStatusEvent) {
    if (!wasAccountActivityChanged) return;

    const eventData: AccountUpdatedActivityEvent = {
      accountId,
      payload: { isAccountActive, employerId },
    };
    const eventInst = plainToInstance(AccountUpdatedActivityEvent, eventData);
    this.eventEmitterService.emit(AccountEvents.UPDATED_ACTIVITY, eventInst);
  }
  @HandleEvent(AccountEvents.BULK_UPDATED_SYSTEM_STATUS)
  onAccountBulkUpdatedSystemStatus({
    payloads,
  }: AccountBulkUpdatedSystemStatusEvent) {
    const data = payloads.filter(
      ({ wasAccountActivityChanged }) => wasAccountActivityChanged,
    );

    const eventData: AccountBulkUpdatedActivityEvent = {
      payloads: data.map<AccountBulkUpdatedActivityEventPayload>(
        ({ accountId, isAccountActive, employerId }) => ({
          accountId: accountId,
          isAccountActive: isAccountActive,
          employerId: employerId,
        }),
      ),
    };
    const eventInst = plainToInstance(
      AccountBulkUpdatedActivityEvent,
      eventData,
    );
    this.eventEmitterService.emit(
      AccountEvents.BULK_UPDATED_ACTIVITY,
      eventInst,
    );
  }
}
