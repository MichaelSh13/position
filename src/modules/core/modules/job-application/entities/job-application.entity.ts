import { ApiProperty } from '@nestjs/swagger';
import { CustomBaseEntity } from 'src/shared/models/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { JobApplicationStatus } from '../consts/job-application-status.const';
import { AccountEntity } from '../../account/entities/account.entity';
import { PositionEntity } from '../../position/entities/position.entity';

@Entity({ name: 'job-application' })
export class JobApplicationEntity extends CustomBaseEntity {
  @ApiProperty()
  @Column('varchar')
  resume: string;

  @ApiProperty()
  @Column('varchar', {
    nullable: true,
  })
  coverLetter?: string;

  @ApiProperty({ enum: JobApplicationStatus })
  @Column('enum', {
    enum: JobApplicationStatus,
    default: JobApplicationStatus.SUBMITTED,
  })
  status: JobApplicationStatus;

  @ApiProperty({ type: String, isArray: true })
  @Column('varchar', {
    array: true,
    nullable: true,
  })
  conditions?: string[];

  @ApiProperty()
  @Column('uuid')
  accountId!: string;
  //
  @ManyToOne(() => AccountEntity, (account) => account.jobApplications)
  @JoinColumn({ name: 'accountId' })
  account?: AccountEntity;

  @ApiProperty()
  @Column('uuid')
  positionId!: string;
  //
  @ManyToOne(() => PositionEntity, (position) => position.jobApplications)
  @JoinColumn({ name: 'positionId' })
  position?: PositionEntity;
}
