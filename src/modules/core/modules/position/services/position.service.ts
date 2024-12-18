import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { EventEmitterService } from 'src/modules/event-emitter-custom/services/event-emitter-custom.service';
import { Repository } from 'typeorm';

import { PositionEvents } from '../consts/position.event.const';
import { PositionSystemStatus } from '../consts/position-system-status.const';
import { PositionUserStatus } from '../consts/position-user-status.const';
import { CreatePositionDto } from '../dto/create-position.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { PositionEntity } from '../entities/position.entity';
import { PositionChangedSystemStatusEvent } from '../events/position-changed-system-status.event';
import { PositionChangedUserStatusEvent } from '../events/position-changed-user-status.event';
import { PositionCreatedEvent } from '../events/position-created.event';
import { PositionUpdatedEvent } from '../events/position-updated.event';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,

    private readonly eventEmitterService: EventEmitterService,
  ) {}

  async createPosition(
    employerId: string,
    { description, title, conditions, location, salary }: CreatePositionDto,
  ): Promise<PositionEntity> {
    try {
      console.log('');
      const positionData: Partial<PositionEntity> = {
        title,
        description,
        location,
        conditions,
        salaryCents: salary ? salary * 100 : undefined,
        employerId,
      };
      const positionInst = this.positionRepository.create(positionData);
      const position = await this.positionRepository.save(positionInst);

      const payloadData: PositionCreatedEvent = {
        positionId: position.id,
        payload: {
          position,
        },
      };
      const payload = plainToInstance(PositionCreatedEvent, payloadData);
      this.eventEmitterService.emit(PositionEvents.CREATED, payload);

      return position;
    } catch (err) {
      // TODO: handle error.
      throw new BadRequestException('Error creating position.');
    }
  }

  async updatePosition(
    employerId: string,
    positionId: string,
    updatePositionDto: UpdatePositionDto,
  ): Promise<PositionEntity> {
    const position = await this.positionRepository.findOneBy({
      id: positionId,
    });
    if (!position || position.employerId !== employerId) {
      // TODO: handle error.
      throw new BadRequestException('Position not found');
    }

    const isEmpty = !Object.keys(updatePositionDto).length;
    if (isEmpty) {
      return position;
    }

    for (const key in updatePositionDto) {
      if (updatePositionDto[key as keyof UpdatePositionDto]) {
        (position as any)[key] =
          updatePositionDto[key as keyof UpdatePositionDto];
      }
    }

    const updatedPosition = await this.positionRepository.save(position);

    const updatedPayloadData: PositionUpdatedEvent = {
      positionId: position.id,
      payload: {
        position,
      },
    };
    const updatedPayload = plainToInstance(
      PositionUpdatedEvent,
      updatedPayloadData,
    );
    // TODO: Maybe need to use custom event emitter service, it allows e.g. to log or save events history.
    this.eventEmitterService.emit(PositionEvents.UPDATED, updatedPayload);

    return updatedPosition;
  }

  async getPosition(id: string): Promise<PositionEntity> {
    const position = await this.positionRepository.findOneBy({
      id,
    });
    if (!position) {
      // TODO: handle error.
      throw new BadRequestException('Position not found');
    }

    return position;
  }

  async getActivePosition(id: string): Promise<PositionEntity> {
    const position = await this.getPosition(id);
    if (!PositionEntity.isActive(position)) {
      // TODO: custom error.
      throw new BadRequestException('Position is not active.');
    }

    return position;
  }

  getPositions(): Promise<PositionEntity[]> {
    return this.positionRepository.find();
  }

  async changePositionSystemStatus(
    positionId: string,
    systemStatus: PositionSystemStatus,
  ): Promise<void> {
    const position = await this.positionRepository.findOneBy({
      id: positionId,
    });
    if (!position) {
      // TODO: handle error.
      throw new BadRequestException('Position not found');
    }

    const { affected } = await this.positionRepository.update(position.id, {
      systemStatus,
    });
    if (!affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during updating position.');
    }

    const changedStatusPayloadData: PositionChangedSystemStatusEvent = {
      positionId: position.id,
      payload: { systemStatus },
    };
    const changedStatusPayload = plainToInstance(
      PositionChangedSystemStatusEvent,
      changedStatusPayloadData,
    );
    this.eventEmitterService.emit(
      PositionEvents.UPDATED_SYSTEM_STATUS,
      changedStatusPayload,
    );
  }

  async changePositionUserStatus(
    employerId: string,
    positionId: string,
    userStatus: PositionUserStatus,
  ): Promise<void> {
    const position = await this.positionRepository.findOneBy({
      id: positionId,
    });
    if (!position || position.employerId !== employerId) {
      // TODO: handle error.
      throw new BadRequestException('Position not found');
    }

    try {
      this.checkPositionCommands(userStatus, position.userStatus);
    } catch (err) {
      // TODO: handle error.
      throw new BadRequestException('Invalid command.', {
        description: err?.message,
      });
    }

    const { affected } = await this.positionRepository.update(position.id, {
      userStatus,
    });
    if (!affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during updating position.');
    }

    const changedStatusPayloadData: PositionChangedUserStatusEvent = {
      positionId: position.id,
      payload: { userStatus },
    };
    const changedStatusPayload = plainToInstance(
      PositionChangedUserStatusEvent,
      changedStatusPayloadData,
    );
    this.eventEmitterService.emit(
      PositionEvents.UPDATED_USER_STATUS,
      changedStatusPayload,
    );
  }

  private checkPositionCommands(
    toStatus: PositionUserStatus,
    currStatus: PositionUserStatus,
  ): never | void {
    const statusesMap: Record<
      PositionUserStatus,
      (status: PositionUserStatus) => never | void
    > = {
      [PositionUserStatus.ACTIVE]: (status) => {
        if (status !== PositionUserStatus.INACTIVE) {
          throw new Error('Position may be activated only if it inactive.');
        }
      },
      [PositionUserStatus.INACTIVE]: (status) => {
        if (status === PositionUserStatus.INACTIVE) {
          throw new Error('Position already is de-activated.');
        }
      },
      [PositionUserStatus.ON_HOLD]: (status) => {
        if (status !== PositionUserStatus.ACTIVE) {
          throw new Error('Position should be active.');
        }
      },
      [PositionUserStatus.ARCHIVED]: (status) => {
        if (status !== PositionUserStatus.INACTIVE) {
          throw new Error('Position should be de-activated.');
        }
      },
    };

    return statusesMap[toStatus](currStatus);
  }
}
