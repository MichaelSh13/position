import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { User } from 'src/modules/core/modules/user/models/user.model';

import type { LoginResponseDto } from '../dto/login-response.dto';
import type { RegistrationDto } from '../dto/registration.dto';
import { UserService } from '../../core/modules/user/services/user.service';
import { JsonWebTokenService } from '../../json-web-token/services/json-web-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jsonWebTokenService: JsonWebTokenService,
    private readonly userService: UserService,
  ) {}

  public async login(user: User) {
    // const permissions = await this.permissionService.getByUser(user.id);

    // const payload: UserEntity = {
    //   ...user,
    //   permissions,
    // };

    // return this.generateAndSetTokens(payload);
    return this.generateAndSetTokens(user);
  }

  public async validate(user: PayloadUser) {
    // const data = await this.cacheManager.get(user.id);

    // if (data) {
    //   const invalidateAt = Number(data);

    //   if (user.iat * 1000 <= invalidateAt) {
    //     throw new UnauthorizedException('Relogin please.');
    //   }

    //   // remove from cache
    // }

    return user;
  }

  // public async invalidUser(userId: string) {
  //   await this.cacheManager.set(
  //     userId,
  //     new Date().getTime(),
  //     25 * 60 * 60 * 1000,
  //   );
  // }

  async validateLocal(email: string, password: string) {
    const user = await this.userService.getByEmailOrFail(email);
    if (!user.password) {
      throw new BadRequestException('Reset your password please.');
    }

    const valid = await bcryptjs.compare(password, user.password);
    if (!valid) {
      throw new ForbiddenException('Wrong password.');
    }

    console.log(user.phone);

    // TODO: use better methods to exclude properties.
    const userData = instanceToPlain(user);

    return plainToInstance(UserEntity, userData);
  }

  public async generateAndSetTokens(
    payload: UserEntity,
  ): Promise<LoginResponseDto> {
    try {
      const access_token = this.jsonWebTokenService.generateAccessToken({
        ...payload,
      });

      return {
        access_token,
      };
    } catch (error) {
      // TODO: Log error with a help of logger and throw just text as custom exceptions.
      throw new InternalServerErrorException('Failed JWT creating.');
    }
  }

  public async registration(
    registrationData: Omit<RegistrationDto, 'passwordConfirm'>,
  ): Promise<UserEntity> {
    const user = await this.userService.getByEmail(registrationData.email);
    if (user) {
      // TODO: use custom exception
      throw new BadRequestException('Email already using.');
    }

    return this.userService.create(registrationData);
  }
}
