import { ApiProperty } from '@nestjs/swagger';
import { CustomBaseEntity } from 'src/shared/models/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { EmployerEntity } from '../../employer/entities/employer.entity';
import { JobApplicationEntity } from '../../job-application/entities/job-application.entity';
import { PositionSystemStatus } from '../consts/position-system-status.const';
import { PositionUserStatus } from '../consts/position-user-status.const';

@Entity({ name: 'position' })
export class PositionEntity extends CustomBaseEntity {
  @ApiProperty()
  @Column('varchar')
  title: string;

  @ApiProperty()
  @Column('varchar')
  description: string;

  @ApiProperty()
  @Column('numeric', {
    nullable: true,
  })
  salaryCents?: number;

  @ApiProperty()
  @Column('varchar', {
    nullable: true,
  })
  location?: string;

  @ApiProperty()
  @Column('varchar', {
    array: true,
    nullable: true,
  })
  conditions?: string[];

  @ApiProperty()
  @Column('enum', {
    enum: PositionSystemStatus,
    default: PositionSystemStatus.PENDING,
  })
  systemStatus: PositionSystemStatus;

  @ApiProperty()
  @Column('enum', {
    enum: PositionUserStatus,
    default: PositionUserStatus.INACTIVE,
  })
  userStatus: PositionUserStatus;

  @ApiProperty()
  @Column('boolean', {
    default: true,
  })
  isParentActive: boolean;

  @ApiProperty({ type: String, nullable: true })
  @Column('varchar', {
    nullable: true,
  })
  // TODO: If we have reason only when parent is not active, so lets just remove isSystemActive and check if reason exist.
  reason?: string;

  @ApiProperty()
  @Column('uuid')
  employerId!: string;
  //
  @ManyToOne(() => EmployerEntity, (employer) => employer.positions)
  @JoinColumn({ name: 'employerId' })
  employer?: EmployerEntity;

  @OneToMany(
    () => JobApplicationEntity,
    (jobApplication) => jobApplication.position,
  )
  jobApplications?: JobApplicationEntity[];

  static isActive(
    position: PositionEntity,
    options: PositionIsActiveOption = {
      error: false,
      approving: true,
      activated: true,
      parent: true,
    },
  ): boolean | never {
    if (
      position.systemStatus === PositionSystemStatus.BLOCKED ||
      position.systemStatus === PositionSystemStatus.REJECTED
    ) {
      if (!options.error) return false;

      throw new Error(`Position is '${position.systemStatus}'.`);
    }
    if (
      options.approving &&
      position.systemStatus !== PositionSystemStatus.APPROVED
    ) {
      if (!options.error) return false;

      throw new Error(`Position is '${position.systemStatus}'.`);
    }
    if (options.parent && !position.isParentActive) {
      if (!options.error) return false;

      throw new Error(`Position is not active. Parent: '${position.reason}''.`);
    }
    if (
      options.activated &&
      position.userStatus !== PositionUserStatus.ACTIVE
    ) {
      if (!options.error) return false;

      throw new Error(`Position is '${position.userStatus}'.`);
    }

    return true;
  }
}
