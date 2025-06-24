import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { EventEmitterService } from 'src/modules/event-emitter-custom/services/event-emitter-custom.service';
import { AccountRoles } from 'src/modules/permission/consts/permission.const';
import {
  DeepPartial,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { AccountEvents } from '../consts/account.event.const';
import { AccountSystemStatus } from '../consts/account-system-status.const';
import { AccountUserStatus } from '../consts/account-user-status.const';
import { AccountEntity } from '../entities/account.entity';
import { AccountInfoEntity } from '../entities/account-info.entity';
import { AccountCreatedEvent } from '../events/account-created.event';
import { AccountUpdatedSystemStatusEvent } from '../events/account-updated-system-status.event';
import { AccountUpdatedUserStatusEvent } from '../events/account-updated-user-status.event';
import { AccountVerifiedEmailEvent } from '../events/account-verified-email.event';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,

    @InjectRepository(AccountInfoEntity)
    private readonly infoRepository: Repository<AccountInfoEntity>,

    private readonly eventEmitterService: EventEmitterService,
  ) {}

  async getAccount(
    options:
      | string
      | FindOptionsWhere<AccountEntity>
      | FindOptionsWhere<AccountEntity>[],
    relations: FindOptionsRelations<AccountEntity> = {},
  ): Promise<AccountEntity> {
    const where = typeof options === 'string' ? { id: options } : options;

    const account = await this.accountRepository.findOne({
      where,
      relations,
    });
    if (!account) {
      // TODO: Use CustomException instead. E.g. AccountNotFoundException.
      throw new NotFoundException('Account not found.');
    }

    // TODO: Password and other important stuff should be excluded
    return account;
  }

  async getAccountInfo(
    options:
      | string
      | FindOptionsWhere<AccountInfoEntity>
      | FindOptionsWhere<AccountInfoEntity>[],
  ): Promise<AccountInfoEntity> {
    const where = typeof options === 'string' ? { id: options } : options;

    const info = await this.infoRepository.findOneBy(where);
    if (!info) {
      // TODO: Use CustomException instead. E.g. InfoNotFoundException.
      throw new NotFoundException('Info not found.');
    }

    // TODO: Password and other important stuff should be excluded
    return info;
  }

  async create({
    password,
    email,
    phone,
    code,
  }: CreateAccountData): Promise<AccountEntity> {
    const existAccount = await this.getAccount([{ email }, { phone }]).catch(
      () => null,
    );
    if (existAccount) {
      // TODO: use custom exception
      throw new BadRequestException('Email or phone already using.');
    }

    try {
      // TODO: Generate and set Salt.
      const SALT_ROUND = 10;
      const hashedPassword = await bcryptjs.hash(password, SALT_ROUND);

      const accountData: DeepPartial<AccountEntity> = {
        email,
        phone,
        roles: [AccountRoles.CLIENT],
        password: hashedPassword,
        info: {
          countryCode: code,
          revokeVerificationSince: new Date(),
        },
      };
      const accountInst = this.accountRepository.create(accountData);
      const account = await this.accountRepository.save(accountInst);

      const payloadData: AccountCreatedEvent = {
        accountId: account.id,
        payload: {
          account,
        },
      };
      const payload = plainToInstance(AccountCreatedEvent, payloadData);
      this.eventEmitterService.emit(AccountEvents.CREATED, payload);

      // TODO: Password and other important stuff should be excluded

      return account;
    } catch (error) {
      console.log(error);
      // TODO: Log error with a help of logger and throw just text as custom exceptions.
      throw new BadRequestException('Account not created.', error);
    }
  }

  async verifyEmail(accountId: string) {
    const account = await this.getAccount(accountId, { info: true });

    const updateData: QueryDeepPartialEntity<AccountInfoEntity> = {
      emailVerifiedAt: new Date(),
      // TODO: Set to null for account-info and employer-info if update system-status right.
      revokeVerificationSince: null,
    };
    const { affected } = await this.infoRepository.update(
      account.infoId,
      updateData,
    );
    if (!affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during verifying email.');
    }

    await this.changeAccountSystemStatus(account, AccountSystemStatus.VERIFIED);

    // TODO: Change event name to account-info instead of account
    const verifiedPayloadData: AccountVerifiedEmailEvent = {
      accountId: account.id,
      payload: {
        email: account.email!,
        systemStatus: account.systemStatus,
        isVerified: true,
      },
    };
    const verifiedPayload = plainToInstance(
      AccountVerifiedEmailEvent,
      verifiedPayloadData,
    );
    this.eventEmitterService.emit(
      AccountEvents.VERIFIED_EMAIL,
      verifiedPayload,
    );
  }

  async changeAccountSystemStatus(
    accountUniq: string | AccountEntity,
    systemStatus: AccountSystemStatus,
    adminId?: string,
  ): Promise<void> {
    const account =
      typeof accountUniq === 'string'
        ? await this.getAccount(accountUniq)
        : accountUniq;
    if (account.systemStatus === systemStatus) {
      // TODO: error;
      throw new BadRequestException(`Account is already '${systemStatus}'.`);
    }

    const wasAccountActivityChanged = AccountEntity.isActive(account, {
      verification: false,
    });

    if (systemStatus === AccountSystemStatus.VERIFIED) {
      if (!account.email && !account.phone) {
        throw new BadRequestException(
          `Account don't have 'email' and 'phone'.`,
        );
      }
    }
    // TODO: Should we also update the account info? E.g. emailVerifiedAt...

    const { affected } = await this.accountRepository.update(account.id, {
      systemStatus,
    });
    if (!affected) {
      // TODO: handle error.
      throw new BadRequestException(
        `Error during update Account system-status.`,
      );
    }
    const updatedAccount: AccountEntity = { ...account, systemStatus };

    // TODO: Log that such admin block such user.
    // TODO: Implement notifications.

    const payloadData: AccountUpdatedSystemStatusEvent = {
      accountId: updatedAccount.id,
      payload: {
        systemStatus: systemStatus,
        employerId: updatedAccount.employerId,
        isAccountActive: AccountEntity.isActive(updatedAccount, {
          verification: false,
        }),
        wasAccountActivityChanged,
      },
    };
    const payload: AccountUpdatedSystemStatusEvent = plainToInstance(
      AccountUpdatedSystemStatusEvent,
      payloadData,
    );
    this.eventEmitterService.emit(AccountEvents.UPDATED_SYSTEM_STATUS, payload);
  }

  async changeAccountUserStatus(
    account: AccountEntity,
    userStatus: AccountUserStatus,
  ): Promise<void> {
    if (account.userStatus === userStatus) {
      // TODO: error;
      throw new BadRequestException(`Account is already ${userStatus}.`);
    }

    const wasAccountActivityChanged = AccountEntity.isActive(account, {
      verification: false,
    });

    const { affected } = await this.accountRepository.update(account.id, {
      userStatus,
    });
    if (!affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during updating user-status.');
    }
    account.userStatus = userStatus;

    // TODO: Log that such admin block such user.
    // TODO: Implement notifications.

    const payloadData: AccountUpdatedUserStatusEvent = {
      accountId: account.id,
      payload: {
        userStatus,
        employerId: account.employerId,
        isAccountActive: AccountEntity.isActive(account, {
          verification: false,
        }),
        wasAccountActivityChanged,
      },
    };
    const payload: AccountUpdatedUserStatusEvent = plainToInstance(
      AccountUpdatedUserStatusEvent,
      payloadData,
    );
    this.eventEmitterService.emit(AccountEvents.UPDATED_USER_STATUS, payload);
  }
}
