import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcryptjs from 'bcryptjs';
// import { Cache } from 'cache-manager';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { isEmail, isPhoneNumber, validate } from 'class-validator';
import { RedisDto } from 'src/modules/configuration/dto/redis.dto';
import { AccountEntity } from 'src/modules/core/modules/account/entities/account.entity';
import { EmailService } from 'src/modules/email/services/email.service';
import { splitPhoneNumber } from 'src/shared/utils/split-phone-number.util';
import { DataSource } from 'typeorm';

import { BLOCK_KEY } from '../consts/block.const';
import { EmailTypes } from '../consts/email.const';
import { ConfirmationDto } from '../dto/confirmation.dto';
import type { RegistrationDto } from '../dto/registration.dto';
import { AccountService } from '../../core/modules/account/services/account.service';
import { JsonWebTokenService } from '../../json-web-token/services/json-web-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jsonWebTokenService: JsonWebTokenService,
    private readonly accountService: AccountService,
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,

    @Inject(CACHE_MANAGER) private cacheManager: CacheManager,
  ) {}

  public async login(account: AccountEntity) {
    try {
      const access_token = this.jsonWebTokenService.generateAccessToken({
        account,
      });

      return {
        access_token,
      };
    } catch (error) {
      // TODO: Log error with a help of logger and throw just text as custom exceptions.
      throw new InternalServerErrorException('Failed JWT creating.');
    }
  }

  public async validate({ account, iat }: PayloadAccount) {
    // TODO: Provide cash token BLACKLIST instead of query to DB.
    const data = await this.cacheManager.get(account.id);

    if (!data) {
      return account;
    }

    // TODO: Maybe needs feature of blocking for certain time.
    if (data === BLOCK_KEY) {
      throw new UnauthorizedException('Account is blocked.');
    }

    const invalidateUntilAt = Number(data);

    // TODO: Use Date's const or special timing library instead direct number as 1000.
    if (iat * 1000 <= invalidateUntilAt) {
      throw new UnauthorizedException('Re-login please.');
    }

    return account;
  }

  // TODO: Maybe need also keep employer info in token.
  // TODO!: React on account changing or on employer creating or removing.
  public async invalidAccount(accountId: string) {
    const { ttl } = this.configService.getOrThrow<RedisDto>('redis');

    await this.cacheManager.set(accountId, new Date().getTime(), ttl);
  }

  async validateLocal(username: string, password: string) {
    const account = await this.accountService.getAccount([
      { email: username },
      { phone: username },
    ]);
    if (!account.password) {
      throw new BadRequestException('Reset your password please.');
    }
    if (account.isBlocked) {
      throw new UnauthorizedException('Account is blocked.');
    }
    // TODO?: To forbid login if not verified.
    // if (!account.emailVerifiedAt) {
    //   throw new ForbiddenException('Account is not verified.');
    // }

    const valid = await bcryptjs.compare(password, account.password);
    if (!valid) {
      throw new ForbiddenException('Wrong password.');
    }

    // TODO: use better methods to exclude properties.
    const accountData = instanceToPlain(account);

    return plainToInstance(AccountEntity, accountData);
  }

  public async registration({
    password,
    username,
  }: RegistrationDto): Promise<void> {
    const accountData: CreateAccountData = {
      password,
    };
    if (isEmail(username)) {
      accountData['email'] = username;
    } else if (isPhoneNumber(username)) {
      const { countryCode, phone } = splitPhoneNumber(username);
      accountData['phone'] = phone;
      accountData['code'] = countryCode;
    }

    const queryRunner = this.dataSource.createQueryRunner();

    // Start a new transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      const account = await this.accountService.create(
        accountData,
        entityManager,
      );
      if (account.email) {
        const confirmationData: ConfirmationDto = {
          accountId: account.id,
          email: account.email,
          type: EmailTypes.VERIFICATION,
        };

        const instance = plainToInstance(ConfirmationDto, confirmationData);
        const errors = await validate(instance);
        errors.forEach((error) => {
          throw new Error(error.toString());
        });

        const token =
          this.jsonWebTokenService.generateMailToken(confirmationData);

        const result = await this.emailService.sendVerificationLink(
          account.email,
          token,
        );

        console.log('Email verification sent result: ', result);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmEmail({ accountId }: ConfirmationDto) {
    await this.accountService.verifyEmail(accountId);
  }
}
