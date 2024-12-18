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
import { EventEmitterService } from 'src/modules/event-emitter-custom/services/event-emitter-custom.service';
import { splitPhoneNumber } from 'src/shared/utils/split-phone-number.util';

import { AccountService } from '../../core/modules/account/services/account.service';
import { JsonWebTokenService } from '../../json-web-token/services/json-web-token.service';
import { AuthEvents } from '../consts/auth.event.const';
import { EmailTypes } from '../consts/email.const';
import { ConfirmationDto } from '../dto/confirmation.dto';
import { PayloadAccount } from '../dto/payload-account.dto';
import type { RegistrationDto } from '../dto/registration.dto';
import { AuthRegisteredEvent } from '../events/auth-registered.event';

@Injectable()
export class AuthService {
  ttl: number;

  constructor(
    private readonly jsonWebTokenService: JsonWebTokenService,
    private readonly accountService: AccountService,
    private readonly configService: ConfigService,
    private readonly eventEmitterService: EventEmitterService,
    private readonly emailService: EmailService,

    @Inject(CACHE_MANAGER) private cacheManager: CacheManager,
  ) {
    const { ttl } = this.configService.getOrThrow<RedisDto>('redis');
    this.ttl = ttl;
  }

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

  public async validateJwtPayload({ account, iat }: PayloadAccount) {
    try {
      AccountEntity.isActive(account, {
        error: true,
        activated: false,
        verification: false,
      });
    } catch (error) {
      // TODO: error.
      throw new UnauthorizedException(error.message);
    }

    // TODO: Provide cash token BLACKLIST instead of query to DB.
    const data = await this.cacheManager.get(account.id);
    if (!data) {
      return account;
    }

    // TODO: Maybe needs feature of blocking for certain time.

    const invalidateUntilAt = Number(data);
    // TODO: Use Date's const or special timing library instead direct number as 1000.
    if (iat * 1000 <= invalidateUntilAt) {
      throw new UnauthorizedException('Re-login please.');
    }

    return account;
  }

  // TODO: Maybe need also keep employer info in token.
  public async invalidAccount(uniq: string | string[]) {
    const ttl = this.ttl;

    if (!Array.isArray(uniq)) {
      return this.cacheManager.set(uniq, new Date().getTime(), ttl);
    }

    return Promise.all(
      uniq.map((accountId) =>
        this.cacheManager.set(accountId, new Date().getTime(), ttl),
      ),
    );

    // TODO: Emit event that account need to re-logic. In this case, we'll send event on socket to the client and re-login him.
    // TODO: If user try to sign-in but he needs to re-login, we will send special code\event\data with response and do re-login automatically on frontend.
  }

  async validateLocal(username: string, password: string) {
    const account = await this.accountService.getAccount(
      [{ email: username }, { phone: username }],
      { employer: true },
    );
    if (!account.password) {
      throw new BadRequestException('Reset your password please.');
    }
    try {
      AccountEntity.isActive(account, {
        error: true,
        activated: false,
        verification: false,
      });
    } catch (error) {
      // TODO: error.
      throw new UnauthorizedException(error.message);
    }

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

    const account = await this.accountService.create(accountData);

    await this.sendVerificationEmail(account);

    // TODO: Think about data validation on both sides: before sending event, on handler where get data.
    // TODO: Phone is currently not supported. Fix it.
    const payloadData: AuthRegisteredEvent = {
      accountId: account.id,
      payload: {
        email: account.email,
      },
    };
    const payload = plainToInstance(AuthRegisteredEvent, payloadData);
    this.eventEmitterService.emit(AuthEvents.REGISTERED, payload);
  }

  async confirmEmail({ accountId }: ConfirmationDto) {
    await this.accountService.verifyEmail(accountId);
  }

  async sendVerificationEmail({ email, id }: AccountEntity): Promise<void> {
    if (!email) {
      throw new BadRequestException("Account don't have email.");
    }

    // TODO: Allow only few email per certain time per account (verification email).
    const confirmationData: ConfirmationDto = {
      accountId: id,
      email,
      type: EmailTypes.VERIFICATION,
    };

    const instance = plainToInstance(ConfirmationDto, confirmationData);
    const errors = await validate(instance);
    errors.forEach((error) => {
      throw new BadRequestException(error.toString());
    });

    const token = this.jsonWebTokenService.generateMailToken(confirmationData);

    const result = await this.emailService.sendVerificationLink(email, token);

    // TODO: Maybe needs to save somewhere email result's data, e.g. email id...

    console.log('Email verification sent result: ', result);
  }
}
