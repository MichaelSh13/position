import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
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

  @Column('varchar', {
    nullable: true,
  })
  password?: string;

  @Expose()
  @Column('varchar', {
    nullable: true,
  })
  phone?: string;

  @Expose()
  @Column('varchar', {
    nullable: true,
  })
  countryCode?: string;

  // TODO: Make sure that there is no possibility to add ADMIN role for user.
  @ApiProperty({ enum: AccountRoles })
  @Expose()
  @Column('enum', {
    enum: AccountRoles,
    default: [AccountRoles.CLIENT],
    array: true,
  })
  roles!: AccountRoles[];

  @ApiProperty({ type: Date })
  @Expose()
  @Column('timestamp with time zone', {
    nullable: true,
  })
  emailVerifiedAt?: Date;

  @ApiProperty({ type: Date })
  @Expose()
  @Column('timestamp with time zone', {
    nullable: true,
  })
  phoneVerifiedAt?: Date;

  @ApiProperty({ type: Boolean })
  @Column('boolean', {
    default: false,
  })
  isBlocked: boolean;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  @RelationId((acc: AccountEntity) => acc.employer)
  employerId?: string;

  @OneToOne(() => EmployerEntity, (employer) => employer.account, {
    nullable: true,
  })
  employer?: EmployerEntity;

  @OneToMany(
    () => JobApplicationEntity,
    (jobApplication) => jobApplication.account,
  )
  jobApplications?: JobApplicationEntity[];

  static isVerified(account?: AccountEntity): boolean {
    if (!account) {
      return false;
    }
    const { phone, phoneVerifiedAt, email, emailVerifiedAt } = account;

    if (!email && !phone) {
      return false;
    }
    if (email && !emailVerifiedAt) {
      return false;
    }
    if (phone && !phoneVerifiedAt) {
      return false;
    }

    return true;
  }
}
