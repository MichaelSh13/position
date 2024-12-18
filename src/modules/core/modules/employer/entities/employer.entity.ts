import { ApiProperty } from '@nestjs/swagger';
import { CustomBaseEntity } from 'src/shared/models/custom-base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  RelationId,
} from 'typeorm';

import { AccountEntity } from '../../account/entities/account.entity';
import { PositionEntity } from '../../position/entities/position.entity';
import { EmployerSystemStatus } from '../consts/employer-system-status.const';
import { EmployerUserStatus } from '../consts/employer-user-status.const';
import { EmployerInfoEntity } from './employer-info.entity';

@Entity({ name: 'employer' })
export class EmployerEntity extends CustomBaseEntity {
  @ApiProperty()
  @Column('uuid', { unique: true })
  accountId: string;

  @ApiProperty({ type: () => AccountEntity, nullable: true })
  @OneToOne(() => AccountEntity, (acc) => acc.employer)
  @JoinColumn({ name: 'accountId' })
  account?: AccountEntity;

  @ApiProperty()
  @Column('enum', {
    enum: EmployerSystemStatus,
    default: EmployerSystemStatus.UNVERIFIED,
  })
  systemStatus: EmployerSystemStatus;

  @ApiProperty()
  @Column('enum', {
    enum: EmployerUserStatus,
    default: EmployerUserStatus.ACTIVE,
  })
  userStatus: EmployerUserStatus;

  @ApiProperty({ type: Boolean })
  @Column('boolean', {
    default: true,
  })
  isParentActive: boolean;

  @Column({
    type: 'uuid',
  })
  @RelationId((acc: EmployerEntity) => acc.info)
  infoId: string;

  @ApiProperty({ nullable: true })
  @OneToOne(() => EmployerInfoEntity, (info) => info.employer, {
    cascade: ['insert', 'remove', 'soft-remove', 'recover'],
  })
  info?: EmployerInfoEntity;

  @ApiProperty({ type: PositionEntity, isArray: true, nullable: true })
  @OneToMany(() => PositionEntity, (position) => position.employer)
  positions?: PositionEntity[];

  static isActive(
    employer: EmployerEntity,
    options: EmployerIsActiveOptions = {
      error: false,
      verification: true,
      activated: true,
      parent: true,
    },
  ): boolean {
    if (
      employer.systemStatus === EmployerSystemStatus.RESTRICTED ||
      employer.systemStatus === EmployerSystemStatus.BLOCKED
    ) {
      if (!options.error) return false;

      throw new Error(`Employer is '${employer.systemStatus}'.`);
    }
    if (
      options.verification &&
      employer.systemStatus !== EmployerSystemStatus.VERIFIED
    ) {
      if (!options.error) return false;

      throw new Error(`Employer is not '${EmployerSystemStatus.VERIFIED}'.`);
    }
    if (
      options.activated &&
      employer.userStatus !== EmployerUserStatus.ACTIVE
    ) {
      if (!options.error) return false;

      throw new Error(`Employer is '${employer.userStatus}'.`);
    }
    if (options.parent && !employer.isParentActive) {
      if (!options.error) return false;

      throw new Error(`Parent is not active.`);
    }

    return true;
  }
}
