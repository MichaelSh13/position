import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { AccountRoles } from 'src/modules/permission/consts/permission.const';
import { Repository } from 'typeorm';

import { AccountEvents } from '../consts/account.event.const';
import { AccountEntity } from '../entities/account.entity';
import { AccountUpdatedEvent } from '../events/account-updated.event';
import { EmployerEvents } from '../../employer/consts/employer.event.const';
import { EmployerCreatedEvent } from '../../employer/events/employer-created.event';

@Injectable()
export class AccountHandlerService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,

    private eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(EmployerEvents.CREATED)
  async handleEmployerVerified({ payload: { account } }: EmployerCreatedEvent) {
    if (account.roles.includes(AccountRoles.EMPLOYER)) {
      // TODO: Logger it.
      return;
    }

    const roles = [...new Set([...account.roles, AccountRoles.EMPLOYER])];
    await this.accountRepository.update(account.id, {
      roles,
    });

    const payloadData: AccountUpdatedEvent = {
      id: account.id,
      payload: account,
    };
    const payload = plainToInstance(AccountUpdatedEvent, payloadData);
    this.eventEmitter.emit(AccountEvents.ROLE_UPDATED_ACCOUNT, payload);
  }
}
