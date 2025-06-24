import { Injectable } from '@nestjs/common';
import { AccountEvents } from 'src/modules/core/modules/account/consts/account.event.const';
import {
  AccountBulkChangedActivityEvent,
  AccountChangedActivityEvent,
} from 'src/modules/core/modules/account/events/account-activity-changed.event';
import { AccountChangedRoleEvent } from 'src/modules/core/modules/account/events/account-changed-role.event';
import { AccountVerifiedEmailEvent } from 'src/modules/core/modules/account/events/account-verified-email.event';
import { EmployerEvents } from 'src/modules/core/modules/employer/consts/employer.event.const';
import {
  EmployerBulkChangedActivityEvent,
  EmployerChangedActivityEvent,
} from 'src/modules/core/modules/employer/events/employer-activity-changed.event';
import { EmployerCreatedEvent } from 'src/modules/core/modules/employer/events/employer-created.event';
import { HandleEvent } from 'src/modules/event-emitter-custom/decorators/handle-event.decorator';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthHandler {
  constructor(private readonly authService: AuthService) {}

  @HandleEvent(AccountEvents.UPDATED_ROLE)
  async onAccountUpdateRole({ accountId }: AccountChangedRoleEvent) {
    this.authService.invalidAccount(accountId);
  }
  @HandleEvent(AccountEvents.UPDATED_ACTIVITY)
  async onAccountUpdateActivity({ accountId }: AccountChangedActivityEvent) {
    this.authService.invalidAccount(accountId);
  }
  @HandleEvent(AccountEvents.BULK_UPDATED_ACTIVITY)
  async onAccountBulkUpdateActivity({
    payloads,
  }: AccountBulkChangedActivityEvent) {
    const accountIds = payloads.map(({ accountId }) => accountId);

    this.authService.invalidAccount(accountIds);
  }
  @HandleEvent(AccountEvents.VERIFIED_EMAIL)
  async onAccountVerifyEmail({ accountId }: AccountVerifiedEmailEvent) {
    this.authService.invalidAccount(accountId);
  }

  @HandleEvent(EmployerEvents.CREATED)
  async onEmployerCreate({ payload: { accountId } }: EmployerCreatedEvent) {
    this.authService.invalidAccount(accountId);
  }
  @HandleEvent(EmployerEvents.UPDATED_ACTIVITY)
  async onEmployerUpdateActivity({
    payload: { accountId },
  }: EmployerChangedActivityEvent) {
    this.authService.invalidAccount(accountId);
  }
  @HandleEvent(EmployerEvents.BULK_UPDATED_ACTIVITY)
  async onEmployerBulkUpdateActivity({
    payloads,
  }: EmployerBulkChangedActivityEvent) {
    const accountIds = payloads.map(({ accountId }) => accountId);

    this.authService.invalidAccount(accountIds);
  }
}
