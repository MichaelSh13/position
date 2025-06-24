import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { CustomBaseEntity } from 'src/shared/models/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AccountEntity } from '../../account/entities/account.entity';
import { EmployerEntity } from '../../employer/entities/employer.entity';
import { JobApplicationEntity } from '../../job-application/entities/job-application.entity';
import { PositionSystemStatus } from '../consts/position-system-status.const';
import { PositionUserStatus } from '../consts/position-user-status.const';

@Entity({ name: 'position' })
export class PositionEntity extends CustomBaseEntity {
  @ApiProperty({ type: String })
  @Column('varchar')
  title: string;

  @ApiProperty()
  @Column('varchar')
  description: string;

  @ApiProperty({ type: Number, nullable: true })
  @Column('numeric', {
    nullable: true,
  })
  salaryCents?: number;

  @ApiProperty({ type: Date, nullable: true })
  @Column('timestamp with time zone', {
    nullable: true,
  })
  publishDate?: Date;

  @ApiProperty({ type: String, nullable: true })
  @Column('varchar', {
    nullable: true,
  })
  location?: string;

  @ApiProperty({ type: [String], nullable: true })
  @Column('varchar', {
    array: true,
    nullable: true,
  })
  conditions?: string[];

  @ApiProperty({ enum: PositionSystemStatus })
  @Column('enum', {
    enum: PositionSystemStatus,
    default: PositionSystemStatus.APPROVED,
  })
  systemStatus: PositionSystemStatus;

  @ApiProperty({ enum: PositionUserStatus })
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

  @ApiProperty()
  @Column('uuid')
  employerId!: string;
  //
  @ApiProperty({ type: () => EmployerEntity, nullable: true })
  @ManyToOne(() => EmployerEntity, (employer) => employer.positions)
  @JoinColumn({ name: 'employerId' })
  employer?: EmployerEntity;

  @OneToMany(
    () => JobApplicationEntity,
    (jobApplication) => jobApplication.position,
  )
  jobApplications?: JobApplicationEntity[];

  @ApiProperty()
  @Column('uuid')
  accountId!: string;
  //
  @ApiProperty({ type: () => AccountEntity, nullable: true })
  @ManyToOne(() => AccountEntity, (account) => account.positions)
  @JoinColumn({ name: 'accountId' })
  account?: AccountEntity;

  @Expose()
  get fullName() {
    return 'some fullname';
  }
  set fullName(_) {}

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
    if (
      options.activated &&
      position.userStatus !== PositionUserStatus.ACTIVE
    ) {
      if (!options.error) return false;

      throw new Error(`Position is '${position.userStatus}'.`);
    }
    if (options.parent && !position.isParentActive) {
      if (!options.error) return false;

      throw new Error(`Parent is not active.`);
    }

    return true;
  }
}
