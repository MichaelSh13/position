import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { EventEmitterService } from 'src/modules/event-emitter-custom/services/event-emitter-custom.service';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

import { AccountSystemStatus } from '../../account/consts/account-system-status.const';
import { AccountEntity } from '../../account/entities/account.entity';
import { EmployerEvents } from '../consts/employer.event.const';
import { EmployerSystemStatus } from '../consts/employer-system-status.const';
import { EmployerUserStatus } from '../consts/employer-user-status.const';
import { CreateEmployerDto } from '../dto/create-employer.dto';
import { EmployerEntity } from '../entities/employer.entity';
import { EmployerCreatedEvent } from '../events/employer-created.event';
import { EmployerUpdatedSystemStatusEvent } from '../events/employer-updated-system-status.event';
import { EmployerUpdatedUserStatusEvent } from '../events/employer-updated-user-status.event';

@Injectable()
export class EmployerService {
  constructor(
    @InjectRepository(EmployerEntity)
    private readonly employerRepository: Repository<EmployerEntity>,

    private readonly eventEmitterService: EventEmitterService,
  ) {}

  async createEmployer(
    account: AccountEntity,
    { pass }: CreateEmployerDto,
  ): Promise<EmployerEntity> {
    if (account.employerId) {
      // TODO: Create a new exception.
      throw new BadRequestException('You already are the "Employer".');
    }
    if (account.systemStatus !== AccountSystemStatus.VERIFIED) {
      // TODO: error
      throw new BadRequestException('Account must be verified.');
    }

    try {
      const employerData: DeepPartial<EmployerEntity> = {
        accountId: account.id,
        isParentActive: AccountEntity.isActive(account, {
          verification: false,
        }),
        info: {
          pass,
          revokeVerificationSince: new Date(),
        },
      };
      const employerInst = this.employerRepository.create(employerData);
      const employer = await this.employerRepository.save(employerInst);

      const payloadData: EmployerCreatedEvent = {
        employerId: employer.id,
        payload: {
          accountId: account.id,
        },
      };
      const payload = plainToInstance(EmployerCreatedEvent, payloadData);
      this.eventEmitterService.emit(EmployerEvents.CREATED, payload);

      return employer;
    } catch (error) {
      console.log(error);
      // TODO: Add logger.
      // TODO: Handle error.
      throw new BadRequestException('Employer not created.');
    }
  }

  async getEmployer(
    options: string | FindOptionsWhere<EmployerEntity>,
  ): Promise<EmployerEntity> {
    const where = typeof options === 'string' ? { id: options } : options;

    const employer = await this.employerRepository.findOneBy(where);

    if (!employer) {
      // TODO: Use custom exception.
      throw new BadRequestException('Employer not found.');
    }

    return employer;
  }

  async changeEmployerSystemStatus(
    employerId: string,
    systemStatus: EmployerSystemStatus,
    _adminId?: string,
  ) {
    const employer = await this.getEmployer(employerId);
    if (employer.systemStatus === systemStatus) {
      // TODO: error;
      throw new BadRequestException(`Employer is already ${systemStatus}.`);
    }

    const { affected } = await this.employerRepository.update(employer.id, {
      systemStatus,
    });
    if (!affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during blocking Employer.');
    }
    const updatedEmployer: EmployerEntity = { ...employer, systemStatus };

    // TODO: Log that such admin block such user.
    // TODO: Implement notifications.

    const wasEmployerActive = EmployerEntity.isActive(employer, {
      verification: false,
    });
    const isEmployerActive = EmployerEntity.isActive(updatedEmployer, {
      verification: false,
    });
    const payloadData: EmployerUpdatedSystemStatusEvent = {
      employerId: updatedEmployer.id,
      payload: {
        accountId: updatedEmployer.accountId,
        systemStatus,
        isEmployerActive,
        wasEmployerActivityChanged: wasEmployerActive === isEmployerActive,
      },
    };
    const payload: EmployerUpdatedSystemStatusEvent = plainToInstance(
      EmployerUpdatedSystemStatusEvent,
      payloadData,
    );
    this.eventEmitterService.emit(
      EmployerEvents.UPDATED_SYSTEM_STATUS,
      payload,
    );
  }

  async changeEmployerUserStatus(
    employer: EmployerEntity,
    userStatus: EmployerUserStatus,
  ) {
    if (employer.userStatus === userStatus) {
      // TODO: error;
      throw new BadRequestException(`Employer is already ${userStatus}.`);
    }

    const { affected } = await this.employerRepository.update(employer.id, {
      userStatus,
    });
    if (!affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during updating user-status.');
    }
    // TODO: Log that such admin block such user.
    // TODO: Implement notifications.

    const updatedEmployer: EmployerEntity = { ...employer, userStatus };
    const wasEmployerActive = EmployerEntity.isActive(employer, {
      verification: false,
    });
    const isEmployerActive = EmployerEntity.isActive(updatedEmployer, {
      verification: false,
    });

    const payloadData: EmployerUpdatedUserStatusEvent = {
      employerId: employer.id,
      payload: {
        userStatus,
        accountId: employer.accountId,
        isEmployerActive,
        wasEmployerActivityChanged: wasEmployerActive === isEmployerActive,
      },
    };
    const payload: EmployerUpdatedUserStatusEvent = plainToInstance(
      EmployerUpdatedUserStatusEvent,
      payloadData,
    );
    this.eventEmitterService.emit(EmployerEvents.UPDATED_USER_STATUS, payload);
  }
}
