import { Injectable } from '@nestjs/common';
import { AccountEvents } from 'src/modules/core/modules/account/consts/account.event.const';
import { AccountBulkUpdatedSystemStatusEvent } from 'src/modules/core/modules/account/events/account-bulk-updated-system-status.event';
import { AccountChangedRoleEvent } from 'src/modules/core/modules/account/events/account-changed-role.event';
import { AccountUpdatedSystemStatusEvent } from 'src/modules/core/modules/account/events/account-updated-system-status.event';
import { AccountUpdatedUserStatusEvent } from 'src/modules/core/modules/account/events/account-updated-user-status.event';
import { AccountVerifiedEmailEvent } from 'src/modules/core/modules/account/events/account-verified-email.event';
import { EmployerEvents } from 'src/modules/core/modules/employer/consts/employer.event.const';
import { EmployerBulkUpdatedSystemStatusEvent } from 'src/modules/core/modules/employer/events/employer-bulk-updated-system-status.event';
import { EmployerCreatedEvent } from 'src/modules/core/modules/employer/events/employer-created.event';
import { EmployerUpdatedSystemStatusEvent } from 'src/modules/core/modules/employer/events/employer-updated-system-status.event';
import { EmployerUpdatedUserStatusEvent } from 'src/modules/core/modules/employer/events/employer-updated-user-status.event';
import { EmployerVerifiedEvent } from 'src/modules/core/modules/employer/events/employer-verified.event';
import { HandleEvent } from 'src/modules/event-emitter-custom/decorators/handle-event.decorator';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthHandler {
  constructor(private readonly authService: AuthService) {}

  // TODO: Deal with invalid account. Currently we may react on one event, this one trigger another and we react on this too and continue.

  // ---------------------- start Account ----------------------
  @HandleEvent(AccountEvents.UPDATED_ROLE)
  async onAccountUpdateRole({ accountId }: AccountChangedRoleEvent) {
    this.authService.invalidAccount(accountId);
  }

  @HandleEvent(AccountEvents.BULK_UPDATED_SYSTEM_STATUS)
  onAccountBulkUpdateSystemStatus({
    payloads,
  }: AccountBulkUpdatedSystemStatusEvent) {
    const accountIds = payloads.map(({ accountId }) => accountId);

    this.authService.invalidAccount(accountIds);
  }

  @HandleEvent(AccountEvents.UPDATED_SYSTEM_STATUS)
  onAccountUpdateSystemStatus({ accountId }: AccountUpdatedSystemStatusEvent) {
    this.authService.invalidAccount(accountId);
  }

  @HandleEvent(AccountEvents.UPDATED_USER_STATUS)
  onAccountUpdateUserStatus({ accountId }: AccountUpdatedUserStatusEvent) {
    this.authService.invalidAccount(accountId);
  }

  @HandleEvent(AccountEvents.VERIFIED_EMAIL)
  onAccountVerifiedEmail({ accountId }: AccountVerifiedEmailEvent) {
    this.authService.invalidAccount(accountId);
  }
  // ---------------------- end Account ----------------------

  // ---------------------- start Account ----------------------
  @HandleEvent(EmployerEvents.CREATED)
  onEmployerCreated({ payload: { accountId } }: EmployerCreatedEvent) {
    this.authService.invalidAccount(accountId);
  }
  @HandleEvent(EmployerEvents.UPDATED_SYSTEM_STATUS)
  onEmployerUpdatedSystemStatus({
    payload: { accountId },
  }: EmployerUpdatedSystemStatusEvent) {
    this.authService.invalidAccount(accountId);
  }
  @HandleEvent(EmployerEvents.UPDATED_USER_STATUS)
  onEmployerUpdatedUserStatus({
    payload: { accountId },
  }: EmployerUpdatedUserStatusEvent) {
    this.authService.invalidAccount(accountId);
  }
  @HandleEvent(EmployerEvents.BULK_UPDATED_SYSTEM_STATUS)
  onEmployerBulkUpdatedSystemStatus({
    payloads,
  }: EmployerBulkUpdatedSystemStatusEvent) {
    const accountIds = payloads.map(({ accountId }) => accountId);

    this.authService.invalidAccount(accountIds);
  }
  @HandleEvent(EmployerEvents.VERIFIED)
  onEmployerVerified({ payload: { accountId } }: EmployerVerifiedEvent) {
    this.authService.invalidAccount(accountId);
  }
  // ---------------------- end Account ----------------------
}
