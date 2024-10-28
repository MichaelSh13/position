import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { PositionStatus } from '../consts/position.const';
import { PositionEvents } from '../consts/position.event.const';
import { PositionStatusCommand } from '../consts/position-status-commands.const';
import { CreatePositionDto } from '../dto/create-position.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { PositionEntity } from '../entities/position.entity';
import { PositionCreatedEvent } from '../events/position-created.event';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createPosition(
    employerId: string,
    { description, title, conditions, location, salary }: CreatePositionDto,
  ): Promise<PositionEntity> {
    try {
      const positionData: Partial<PositionEntity> = {
        title,
        description,
        location,
        conditions,
        salaryCents: salary ? salary * 100 : undefined,
        status: PositionStatus.PENDING,
        employerId,
      };
      const positionInst = this.positionRepository.create(positionData);
      const position = await this.positionRepository.save(positionInst);

      const payloadData: PositionCreatedEvent = {
        id: employerId,
        payload: {
          position,
        },
      };
      const payload = plainToInstance(PositionCreatedEvent, payloadData);
      this.eventEmitter.emit(PositionEvents.CREATED, payload);

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

    return this.positionRepository.save(position);
  }

  async changePositionStatus(
    employerId: string,
    positionId: string,
    command: PositionStatusCommand,
  ): Promise<void> {
    const position = await this.positionRepository.findOneBy({
      id: positionId,
    });
    if (!position || position.employerId !== employerId) {
      // TODO: handle error.
      throw new BadRequestException('Position not found');
    }

    let status: PositionStatus;
    try {
      status = this.checkPositionCommands(command, position.status);
    } catch (err) {
      // TODO: handle error.
      throw new BadRequestException('Invalid command.', {
        description: err?.message,
      });
    }

    const updated = await this.positionRepository.update(position.id, {
      status,
    });
    if (!updated.affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during updating position.');
    }

    // TODO: emit event if position status is changed.
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
    if (position.status !== PositionStatus.ACTIVE) {
      // TODO: custom error.
      throw new BadRequestException('Position is not active.');
    }

    return position;
  }

  getPositions(): Promise<PositionEntity[]> {
    return this.positionRepository.find();
  }

  private checkPositionCommands(
    command: PositionStatusCommand,
    status: PositionStatus,
  ) {
    const commands: Record<
      PositionStatusCommand,
      (status: PositionStatus) => PositionStatus
    > = {
      [PositionStatusCommand.ACTIVE]: (status) => {
        if (
          status !== PositionStatus.INACTIVE &&
          status !== PositionStatus.APPROVED
        ) {
          throw new Error('Position should be inactive or just approved.');
        }
        return PositionStatus.ACTIVE;
      },
      [PositionStatusCommand.INACTIVE]: (status) => {
        if (status !== PositionStatus.ACTIVE) {
          throw new Error('Position should be active.');
        }

        return PositionStatus.INACTIVE;
      },
      [PositionStatusCommand.ARCHIVE]: (status) => {
        if (status !== PositionStatus.INACTIVE) {
          throw new Error('Position should be inactive.');
        }

        return PositionStatus.ARCHIVED;
      },
      [PositionStatusCommand.UNARCHIVE]: (status) => {
        if (status !== PositionStatus.ARCHIVED) {
          throw new Error('Position should be archived.');
        }

        return PositionStatus.INACTIVE;
      },
    };

    return commands[command](status);
  }
}
