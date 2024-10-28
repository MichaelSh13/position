import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';
import { AccountRoles } from 'src/modules/permission/consts/permission.const';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';

import { AccountEntity } from '../entities/account.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,

    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: CacheManager,
  ) {}

  async getAccount(
    options:
      | string
      | FindOptionsWhere<AccountEntity>
      | FindOptionsWhere<AccountEntity>[],
  ): Promise<AccountEntity> {
    const where = typeof options === 'string' ? { id: options } : options;

    const account = await this.accountRepository.findOneBy(where);
    if (!account) {
      // TODO: Use CustomException instead. E.g. AccountNotFoundException.
      throw new NotFoundException('Account not found.');
    }

    // TODO: Password and other important stuff should be excluded
    return account;
  }

  async create(
    { password, email, phone, code }: CreateAccountData,
    entityManager?: EntityManager,
  ): Promise<AccountEntity> {
    const existAcc = await this.getAccount([{ email }, { phone }]).catch(
      () => null,
    );
    if (existAcc) {
      // TODO: use custom exception
      throw new BadRequestException('Email or phone already using.');
    }

    let accountRepository = this.accountRepository;
    if (entityManager) {
      accountRepository = entityManager.getRepository(AccountEntity);
    }

    try {
      // TODO: Generate and set Salt.
      const SALT_ROUND = 10;
      const hashedPassword = await bcryptjs.hash(password, SALT_ROUND);

      const accountData: Partial<AccountEntity> = {
        email,
        phone,
        countryCode: code,
        roles: [AccountRoles.CLIENT],
        password: hashedPassword,
      };

      const accountInst = accountRepository.create(accountData);
      const account = await accountRepository.save(accountInst);

      // TODO: Password and other important stuff should be excluded

      return account;
    } catch (error) {
      console.log(error);
      // TODO: Log error with a help of logger and throw just text as custom exceptions.
      throw new BadRequestException('Account not created.', error);
    }
  }

  async verifyEmail(accountId: string) {
    const account = await this.getAccount(accountId);

    const updated = await this.accountRepository.update(account.id, {
      emailVerifiedAt: new Date(),
    });
    if (!updated.affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during verifying account.');
    }

    // TODO: emit event
  }
}
