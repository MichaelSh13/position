import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';
import { Repository } from 'typeorm';

import type { CreateUserDto } from '../dto/create-user.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getByEmailOrFail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      // TODO: Use CustomException instead. E.g. UserNotFoundException.
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  getByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async create({ password, ...createUserData }: CreateUserDto) {
    try {
      // TODO: Generate and set Salt.
      const hashedPassword = await bcryptjs.hash(password, 10);

      const userInst = this.userRepository.create({
        ...createUserData,
        password: hashedPassword,
      });

      return this.userRepository.save(userInst);
    } catch (error) {
      // TODO: Log error with a help of logger and throw just text as custom exceptions.
      throw new BadRequestException('User not created.', error);
    }
  }
}
