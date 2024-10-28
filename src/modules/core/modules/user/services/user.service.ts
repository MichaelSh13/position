import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

import type { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getByEmailOrFail(email: string) {
    const user: User | null = await this.userRepository.findOne({
      email,
    });
    if (!user) {
      // TODO: Use CustomException instead. E.g. UserNotFoundException.
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  getByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ email });
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
