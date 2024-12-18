import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { EventEmitterService } from 'src/modules/event-emitter-custom/services/event-emitter-custom.service';
import { In, LessThanOrEqual, Not, Repository } from 'typeorm';

import { EmployerEvents } from '../consts/employer.event.const';
import { EmployerSystemStatus } from '../consts/employer-system-status.const';
import { EmployerEntity } from '../entities/employer.entity';
import {
  EmployerBulkUpdatedSystemStatusEvent,
  EmployerBulkUpdatedSystemStatusEventPayload,
} from '../events/employer-bulk-updated-system-status.event';

@Injectable()
export class EmployerJobService {
  constructor(
    @InjectRepository(EmployerEntity)
    private readonly employerRepository: Repository<EmployerEntity>,

    private readonly eventEmitterService: EventEmitterService,
  ) {}

  @Cron('* */1 * * *')
  async deactivateStaleEmployers() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const employers = await this.employerRepository.find({
      where: {
        systemStatus: Not(
          In([EmployerSystemStatus.BLOCKED, EmployerSystemStatus.RESTRICTED]),
        ),
        info: {
          revokeVerificationSince: LessThanOrEqual(threeDaysAgo),
        },
      },
      relations: { info: true },
    });
    if (!employers.length) return;

    const employersIds = employers.map(({ id }) => id);
    const { affected } = await this.employerRepository.update(employersIds, {
      systemStatus: EmployerSystemStatus.RESTRICTED,
    });
    if (affected !== employersIds.length) {
      // TODO: logger

      if (!affected) return;
    }

    const payloadData: EmployerBulkUpdatedSystemStatusEvent = {
      systemStatus: EmployerSystemStatus.RESTRICTED,
      payloads: employers.map<EmployerBulkUpdatedSystemStatusEventPayload>(
        (employer) => ({
          accountId: employer.accountId,
          employerId: employer.id,
          isEmployerActive: false,
          wasEmployerActivityChanged:
            EmployerEntity.isActive(employer, { verification: false }) !==
            false,
        }),
      ),
    };
    const payload = plainToInstance(
      EmployerBulkUpdatedSystemStatusEvent,
      payloadData,
    );
    this.eventEmitterService.emit(
      EmployerEvents.BULK_UPDATED_SYSTEM_STATUS,
      payload,
    );
  }
}
