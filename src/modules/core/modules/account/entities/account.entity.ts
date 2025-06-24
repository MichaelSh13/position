import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { AccountRoles } from 'src/modules/permission/consts/permission.const';
import { CustomBaseEntity } from 'src/shared/models/custom-base.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  RelationId,
  Unique,
} from 'typeorm';

import { EmployerEntity } from '../../employer/entities/employer.entity';
import { JobApplicationEntity } from '../../job-application/entities/job-application.entity';
import { PositionEntity } from '../../position/entities/position.entity';
import { RatingEntity } from '../../rating/entities/rating.entity';
import { AccountSystemStatus } from '../consts/account-system-status.const';
import { AccountUserStatus } from '../consts/account-user-status.const';
import { AccountInfoEntity } from './account-info.entity';

@Exclude()
@Entity({ name: 'account' })
@Unique('email_or_phone_uniq', ['email', 'phone'])
export class AccountEntity extends CustomBaseEntity {
  @ApiProperty({ type: String })
  @Expose()
  @Column('varchar', {
    nullable: true,
  })
  email?: string;

  @Expose()
  @Column('varchar', {
    nullable: true,
  })
  phone?: string;

  // TODO: Make sure that there is no possibility to add ADMIN role for user.
  @ApiProperty({ enum: AccountRoles })
  @Expose()
  @Column('enum', {
    enum: AccountRoles,
    default: [AccountRoles.CLIENT],
    array: true,
  })
  roles!: AccountRoles[];

  @Column('varchar', {
    nullable: true,
  })
  password?: string;

  @ApiProperty()
  @Expose()
  @Column('enum', {
    enum: AccountSystemStatus,
    default: AccountSystemStatus.UNVERIFIED,
  })
  systemStatus: AccountSystemStatus;

  @ApiProperty()
  @Expose()
  @Column('enum', {
    enum: AccountUserStatus,
    default: AccountUserStatus.ACTIVE,
  })
  userStatus: AccountUserStatus;

  @ApiProperty()
  @Expose()
  @RelationId((acc: AccountEntity) => acc.info)
  infoId: string;
  //
  @ApiProperty({ type: () => AccountInfoEntity, nullable: true })
  @Expose()
  @OneToOne(() => AccountInfoEntity, (info) => info.account, {
    cascade: ['insert', 'remove', 'soft-remove', 'recover'],
  })
  @Type(() => AccountInfoEntity)
  info?: AccountInfoEntity;

  @ApiProperty({ required: false })
  @Expose()
  @RelationId((acc: AccountEntity) => acc.employer)
  employerId?: string;
  //
  @ApiProperty({ type: EmployerEntity, required: false })
  @Expose()
  @OneToOne(() => EmployerEntity, (employer) => employer.account, {
    nullable: true,
  })
  @Type(() => EmployerEntity)
  employer?: EmployerEntity;

  @OneToMany(
    () => JobApplicationEntity,
    (jobApplication) => jobApplication.account,
  )
  jobApplications?: JobApplicationEntity[];

  @OneToMany(() => RatingEntity, (rating) => rating.account)
  ratings?: RatingEntity[];

  @ApiProperty({ type: () => PositionEntity, isArray: true, nullable: true })
  @OneToMany(() => PositionEntity, (position) => position.employer)
  positions?: PositionEntity[];

  static isActive(
    account: AccountEntity,
    options: AccountIsActiveOptions = {
      error: false,
      activated: true,
      verification: true,
    },
  ): boolean {
    if (
      account.systemStatus !== AccountSystemStatus.VERIFIED &&
      account.systemStatus !== AccountSystemStatus.UNVERIFIED
    ) {
      if (!options.error) return false;

      throw new Error(`Account is '${account.systemStatus}'.`);
    }
    if (options.activated && account.userStatus !== AccountUserStatus.ACTIVE) {
      if (!options.error) return false;

      throw new Error(`Account is '${account.userStatus}'.`);
    }
    if (
      options.verification &&
      account.systemStatus !== AccountSystemStatus.VERIFIED
    ) {
      if (!options.error) return false;

      throw new Error(`Account is not '${AccountSystemStatus.VERIFIED}'.`);
    }

    return true;
  }
}
