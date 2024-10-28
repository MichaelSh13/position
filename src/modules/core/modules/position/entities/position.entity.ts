import { ApiProperty } from '@nestjs/swagger';
import { CustomBaseEntity } from 'src/shared/models/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { PositionStatus } from '../consts/position.const';
import { EmployerEntity } from '../../employer/entities/employer.entity';
import { JobApplicationEntity } from '../../job-application/entities/job-application.entity';

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
    enum: PositionStatus,
    default: PositionStatus.PENDING,
  })
  status: PositionStatus;

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
}
