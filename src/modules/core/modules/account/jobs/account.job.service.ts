import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { EventEmitterService } from 'src/modules/event-emitter-custom/services/event-emitter-custom.service';
import { In, LessThanOrEqual, Not, Repository } from 'typeorm';

import { AccountEvents } from '../consts/account.event.const';
import { AccountSystemStatus } from '../consts/account-system-status.const';
import { AccountEntity } from '../entities/account.entity';
import {
  AccountBulkUpdatedSystemStatusEvent,
  AccountBulkUpdatedSystemStatusEventPayload,
} from '../events/account-bulk-updated-system-status.event';

@Injectable()
export class AccountJobService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,

    private readonly eventEmitterService: EventEmitterService,
  ) {}

  @Cron('* */1 * * *')
  async deactivateStaleAccounts() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const accounts = await this.accountRepository.find({
      where: {
        systemStatus: Not(
          In([AccountSystemStatus.BLOCKED, AccountSystemStatus.RESTRICTED]),
        ),
        info: {
          revokeVerificationSince: LessThanOrEqual(threeDaysAgo),
        },
      },
      relations: { info: true },
    });
    if (!accounts.length) return;

    const accountsIds = accounts.map(({ id }) => id);
    const { affected } = await this.accountRepository.update(accountsIds, {
      systemStatus: AccountSystemStatus.RESTRICTED,
    });
    if (affected !== accountsIds.length) {
      // TODO: logger

      if (!affected) return;
    }

    const payloadData: AccountBulkUpdatedSystemStatusEvent = {
      systemStatus: AccountSystemStatus.RESTRICTED,
      payloads: accounts.map<AccountBulkUpdatedSystemStatusEventPayload>(
        (account) => ({
          accountId: account.id,
          employerId: account.employerId,
          isAccountActive: false,
          wasAccountActivityChanged:
            AccountEntity.isActive(account, { verification: false }) !== false,
        }),
      ),
    };
    const payload = plainToInstance(
      AccountBulkUpdatedSystemStatusEvent,
      payloadData,
    );
    this.eventEmitterService.emit(
      AccountEvents.BULK_UPDATED_SYSTEM_STATUS,
      payload,
    );
  }
}
