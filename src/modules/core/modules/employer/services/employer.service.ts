import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { EmployerEvents } from '../consts/employer.event.const';
import { EmployerEntity } from '../entities/employer.entity';
import { EmployerCreatedEvent } from '../events/employer-created.event';
import { AccountEntity } from '../../account/entities/account.entity';

@Injectable()
export class EmployerService {
  constructor(
    @InjectRepository(EmployerEntity)
    private readonly employerRepository: Repository<EmployerEntity>,

    private eventEmitter: EventEmitter2,
  ) {}

  async createEmployer(account: AccountEntity) {
    if (account.employerId) {
      // TODO: Create a new exception.
      throw new BadRequestException('You already are the "Employer".');
    }

    try {
      const employerData: Partial<EmployerEntity> = {
        accountId: account.id,
        // TODO: Remove line below after implementing verification.
        verifiedAt: new Date(),
      };
      const employerInst = this.employerRepository.create(employerData);
      const employer = await this.employerRepository.save(employerInst);

      const payloadData: EmployerCreatedEvent = {
        id: employer.id,
        payload: {
          account,
          employer,
        },
      };
      const payload = plainToInstance(EmployerCreatedEvent, payloadData);
      this.eventEmitter.emit(EmployerEvents.CREATED, payload);

      return employer;
    } catch (error) {
      console.log(error);
      // TODO: Add logger.
      // TODO: Handle error.
      throw new BadRequestException('Employer not created.');
    }
  }

  async getEmployer(employerId: string): Promise<EmployerEntity> {
    const employer = await this.employerRepository.findOneBy({
      id: employerId,
    });

    if (!employer) {
      // TODO: Use custom exception.
      throw new BadRequestException('Employer not found.');
    }

    return employer;
  }

  async verifyEmployer(employerId: string): Promise<void> {
    const employer = await this.getEmployer(employerId);
    if (employer.verifiedAt) {
      // TODO: use custom error.
      throw new BadRequestException('Employer is already verified.');
    }

    const updated = await this.employerRepository.update(employerId, {
      verifiedAt: new Date(),
    });
    if (!updated.affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during verifying employer.');
    }

    // TODO: emit event
    // const payloadData: EmployerVerifiedEvent = {
    //   id: account.employerId,
    //   payload: {
    //     account,
    //   },
    // };
    // const payload = plainToInstance(EmployerVerifiedEvent, payloadData);
    // this.eventEmitter.emit(EmployerEvents.VERIFIED, payload);
  }
}
