import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { CustomBaseEntity } from 'src/shared/models/custom-base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  RelationId,
} from 'typeorm';

import { AccountEntity } from '../../account/entities/account.entity';
import { ConversationEntity } from '../../conversation/entities/conversation.entity';
import { PositionEntity } from '../../position/entities/position.entity';
import { JobApplicationClientStatus } from '../consts/job-application-client-status.const';
import { JobApplicationSystemStatus } from '../consts/job-application-system-status.const';
import { JobApplicationUserStatus } from '../consts/job-application-user-status.const';

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

  @ApiProperty({ type: String, isArray: true })
  @Column('varchar', {
    array: true,
    nullable: true,
  })
  conditions?: string[];

  @ApiProperty()
  @Column('enum', {
    enum: JobApplicationSystemStatus,
    default: JobApplicationSystemStatus.ACTIVE,
  })
  systemStatus: JobApplicationSystemStatus;

  @ApiProperty()
  @Column('enum', {
    enum: JobApplicationUserStatus,
    default: JobApplicationUserStatus.SUBMITTED,
  })
  userStatus: JobApplicationUserStatus;

  @ApiProperty()
  @Column('enum', {
    enum: JobApplicationClientStatus,
    default: JobApplicationClientStatus.PENDING,
  })
  clientStatus: JobApplicationClientStatus;

  @ApiProperty()
  @Column('boolean', {
    default: true,
  })
  isPositionActive: boolean;

  @ApiProperty()
  @Column('boolean', {
    default: true,
  })
  isAccountActive: boolean;

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
  @ApiProperty({ type: () => PositionEntity, required: false })
  @ManyToOne(() => PositionEntity, (position) => position.jobApplications)
  @JoinColumn({ name: 'positionId' })
  position?: PositionEntity;

  @ApiProperty()
  @Expose()
  @RelationId(
    (jobApplication: JobApplicationEntity) => jobApplication.conversation,
  )
  conversationId: string;
  //
  @OneToOne(
    () => ConversationEntity,
    (conversation) => conversation.jobApplication,
    { cascade: ['insert', 'remove', 'soft-remove', 'recover'] },
  )
  conversation: ConversationEntity;

  static isActive(
    jobApplication: JobApplicationEntity,
    options: JobApplicationIsActiveOption = {
      error: false,
      parent: true,
      user: true,
      client: true,
      account: true,
    },
  ): boolean | never {
    if (jobApplication.systemStatus !== JobApplicationSystemStatus.ACTIVE) {
      if (!options.error) return false;

      throw new Error(`Job-application is '${jobApplication.systemStatus}'.`);
    }
    if (
      options.user &&
      jobApplication.userStatus !== JobApplicationUserStatus.SUBMITTED
    ) {
      if (!options.error) return false;

      throw new Error(`Job-application is '${jobApplication.systemStatus}'.`);
    }
    if (
      options.client &&
      jobApplication.clientStatus !== JobApplicationClientStatus.PENDING
    ) {
      if (!options.error) return false;

      throw new Error(`Job-application is '${jobApplication.userStatus}'.`);
    }
    if (options.parent && !jobApplication.isPositionActive) {
      if (!options.error) return false;

      throw new Error(`Parent is not active.`);
    }
    if (options.account && !jobApplication.isAccountActive) {
      if (!options.error) return false;

      throw new Error(`Account is not active.`);
    }

    return true;
  }
}
