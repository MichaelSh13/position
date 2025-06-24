import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { EventEmitterService } from 'src/modules/event-emitter-custom/services/event-emitter-custom.service';
import { Repository } from 'typeorm';

import { PositionEvents } from '../consts/position.event.const';
import { PositionSystemStatus } from '../consts/position-system-status.const';
import { PositionUserStatus } from '../consts/position-user-status.const';
import { CreatePositionDto } from '../dto/create-position.dto';
import { PositionInfoDto } from '../dto/position-info.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { PositionEntity } from '../entities/position.entity';
import { PositionChangedUserStatusEvent } from '../events/position-changed-user-status.event';
import { PositionCreatedEvent } from '../events/position-created.event';
import { PositionUpdatedEvent } from '../events/position-updated.event';
import { PositionUpdatedSystemStatusEvent } from '../events/position-updated-system-status.event';

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
      const positionData: Partial<PositionEntity> = {
        title,
        description,
        location,
        conditions,
        // TODO: Use service or find a better way to handle salary.
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
      throw new BadRequestException('Position not found');
    }

    return position;
  }

  async getPositionInfo(
    positionId: string,
    accountId?: string,
  ): Promise<PositionInfoDto> {
    const positionQB = this.positionRepository
      .createQueryBuilder('position')
      .leftJoinAndSelect('position.jobApplications', 'jobApplication')
      .where('position.id = :positionId', { positionId })
      .loadRelationCountAndMap(
        'position.jobApplicationCount',
        'position.jobApplications',
      );

    if (accountId) {
      positionQB
        .addSelect(
          (qb) =>
            qb
              .select('jobApplication.accountId', 'appliedAccountId')
              .from('job-application', 'jobApplication')
              .where('jobApplication.positionId = position.id')
              .andWhere('jobApplication.accountId = :accountId')
              .limit(1),
          'appliedAccountId',
        )
        .groupBy('position.id')
        .setParameter('accountId', accountId);
    }

    const { entities, raw } = await positionQB.getRawAndEntities();

    const position = entities[0];
    if (!position) {
      throw new BadRequestException('Position not found');
    }

    const positionInfo = plainToInstance(PositionInfoDto, {
      ...position,
      appliedAccountId: raw[0]?.appliedAccountId ?? null,
    });

    return positionInfo;
  }

  async getActivePosition(id: string): Promise<PositionEntity> {
    const position = await this.getPosition(id);
    if (!PositionEntity.isActive(position)) {
      // TODO: custom error.
      throw new BadRequestException('Position is not active.');
    }

    return position;
  }

  // TODO: Write tests.
  async getActivePositions(accountId?: string): Promise<PositionInfoDto[]> {
    // TODO: Exclude all Position field and expose for specific groups, specific fields.
    const positionsQB = this.positionRepository
      .createQueryBuilder('position')
      .leftJoin('position.jobApplications', 'jobApplication')
      // TODO: Use something better then manually write all options for active positions.
      .where('position.isParentActive = :isParentActive', {
        isParentActive: true,
      })
      .andWhere('position.systemStatus = :systemStatus', {
        systemStatus: PositionSystemStatus.APPROVED,
      })
      .andWhere('position.userStatus = :userStatus', {
        userStatus: PositionUserStatus.ACTIVE,
      })
      .loadRelationCountAndMap(
        'position.jobApplicationCount',
        'position.jobApplications',
      );

    if (accountId) {
      positionsQB
        .addSelect(
          (qb) =>
            qb
              .select('jobApplication.accountId', 'appliedAccountId')
              .from('job-application', 'jobApplication')
              .where('jobApplication.positionId = position.id')
              .andWhere('jobApplication.accountId = :accountId')
              .limit(1),
          'appliedAccountId',
        )
        .groupBy('position.id')
        .setParameter('accountId', accountId);
    }

    const { entities, raw } = await positionsQB.getRawAndEntities();
    const positions = entities.map((position, i) =>
      plainToInstance(PositionInfoDto, {
        ...position,
        appliedAccountId: raw[i].appliedAccountId,
      }),
    );

    const activePositions = positions.filter((position) =>
      PositionEntity.isActive(position),
    );

    return activePositions;
  }

  async changePositionSystemStatus(
    positionId: string,
    systemStatus: PositionSystemStatus,
  ): Promise<void> {
    const position = await this.getPosition(positionId);
    if (position.systemStatus === systemStatus) {
      throw new BadRequestException(`Position is already ${systemStatus}.`);
    }

    const { affected } = await this.positionRepository.update(position.id, {
      systemStatus,
    });
    if (!affected) {
      // TODO: handle error.
      throw new BadRequestException('Error during updating position.');
    }

    const updatedPosition = plainToInstance(PositionEntity, {
      ...position,
      systemStatus,
    });

    const wasPositionActive = PositionEntity.isActive(position);
    const isPositionActive = PositionEntity.isActive(updatedPosition);

    const changedStatusPayloadData: PositionUpdatedSystemStatusEvent = {
      positionId: position.id,
      payload: {
        systemStatus,
        isPositionActive,
        employerId: position.employerId,
        wasPositionActivityChanged: wasPositionActive === isPositionActive,
      },
    };
    const changedStatusPayload = plainToInstance(
      PositionUpdatedSystemStatusEvent,
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
