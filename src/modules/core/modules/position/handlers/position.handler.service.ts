import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { HandleEvent } from 'src/modules/event-emitter-custom/decorators/handle-event.decorator';
import { EventEmitterService } from 'src/modules/event-emitter-custom/services/event-emitter-custom.service';
import { In, Repository } from 'typeorm';

import { EmployerEvents } from '../../employer/consts/employer.event.const';
import {
  EmployerBulkUpdatedActivityEvent,
  EmployerBulkUpdatedActivityEventPayload,
} from '../../employer/events/employer-bulk-updated-activity.event';
import { EmployerUpdatedActivityEvent } from '../../employer/events/employer-updated-activity.event';
import { PositionEvents } from '../consts/position.event.const';
import { PositionEntity } from '../entities/position.entity';
import {
  PositionBulkUpdatedActivityEvent,
  PositionBulkUpdatedActivityEventPayload,
} from '../events/position-bulk-updated-activity.event';

@Injectable()
export class PositionHandlerService {
  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,

    private readonly eventEmitterService: EventEmitterService,
  ) {}

  // TODO: Move to position service.
  private async updatePositions(
    positions: PositionEntity[],
    isParentActive: boolean,
  ): Promise<PositionEntity[]> {
    if (!positions.length) return [];

    const { affected } = await this.positionRepository.update(
      positions.map(({ id }) => id),
      { isParentActive },
    );
    if (affected !== positions.length) {
      // TODO: error
    }

    const result = positions.map((position) => ({
      ...position,
      isParentActive,
    }));

    return result;
  }

  private async bulkPositionUpdate(
    data: EmployerBulkUpdatedActivityEventPayload[],
  ) {
    if (!data.length) return;

    const employerIds: string[] = [];
    const eventEmployersMap: Record<
      string,
      EmployerBulkUpdatedActivityEventPayload
    > = {};
    for (const payload of data) {
      employerIds.push(payload.employerId);
      eventEmployersMap[payload.employerId] = payload;
    }

    const positions = await this.positionRepository.findBy({
      employerId: In(employerIds),
    });
    if (employerIds.length !== positions.length) {
      // TODO: Log data

      if (!positions.length) {
        // TODO: Error
        return;
      }
    }

    const toActivatePositions: PositionEntity[] = [];
    const toDeactivatePositions: PositionEntity[] = [];
    for (const position of positions) {
      if (
        position.isParentActive ===
        eventEmployersMap[position.id].isEmployerActive
      )
        continue;

      if (position.isParentActive) {
        toDeactivatePositions.push(position);
        continue;
      }

      toActivatePositions.push(position);
    }

    const [activatedPositions, deactivatedPositions] = await Promise.all([
      this.updatePositions(toActivatePositions, true),
      this.updatePositions(toDeactivatePositions, false),
    ]);
    const updatedPositions = [...activatedPositions, ...deactivatedPositions];

    const payloadData: PositionBulkUpdatedActivityEvent = {
      payloads: updatedPositions.map<PositionBulkUpdatedActivityEventPayload>(
        (position) => ({
          accountId: eventEmployersMap[position.id].accountId,
          employerId: position.employerId,
          positionId: position.id,
          isPositionActive: PositionEntity.isActive(position),
        }),
      ),
    };
    const payload = plainToInstance(
      PositionBulkUpdatedActivityEvent,
      payloadData,
    );
    this.eventEmitterService.emit(
      PositionEvents.BULK_UPDATED_ACTIVITY,
      payload,
    );
  }

  @HandleEvent(EmployerEvents.BULK_UPDATED_ACTIVITY)
  async onEmployerBulkUpdatedActivity({
    payloads,
  }: EmployerBulkUpdatedActivityEvent) {
    await this.bulkPositionUpdate(payloads);
  }

  @HandleEvent(EmployerEvents.UPDATED_ACTIVITY)
  async onEmployerUpdatedActivity({
    employerId,
    payload: { accountId, isEmployerActive },
  }: EmployerUpdatedActivityEvent) {
    const payload: EmployerBulkUpdatedActivityEventPayload = {
      accountId,
      employerId,
      isEmployerActive,
    };

    await this.bulkPositionUpdate([payload]);
  }
}
