import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MS_IN_DAY } from 'src/shared/consts/time.const';
import { CustomBaseEntity } from 'src/shared/models/custom-base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { AccountEntity } from './account.entity';

@Entity({ name: 'account-info' })
export class AccountInfoEntity extends CustomBaseEntity {
  @ApiProperty()
  @Column('varchar', {
    nullable: true,
  })
  firstName?: string;

  @ApiProperty()
  @Column('varchar', {
    nullable: true,
  })
  lastName?: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  get fullName() {
    if (!this.firstName || !this.lastName) return;

    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }

    return this.firstName ?? this.lastName;
  }

  @Expose()
  @Column('varchar', {
    nullable: true,
  })
  countryCode?: string;

  @ApiProperty({ type: Date })
  @Expose()
  @Column('timestamp with time zone', {
    nullable: true,
  })
  emailVerifiedAt?: Date | null;

  @ApiProperty({ type: Date })
  @Expose()
  @Column('timestamp with time zone', {
    nullable: true,
  })
  phoneVerifiedAt?: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  @Column('timestamp with time zone', {
    nullable: true,
  })
  revokeVerificationSince?: Date | null;

  @ApiProperty()
  @Column('uuid', { unique: true })
  accountId: string;
  //
  @ApiProperty({ type: () => AccountEntity, nullable: true })
  @OneToOne(() => AccountEntity, (acc) => acc.info)
  @JoinColumn({ name: 'accountId' })
  account?: AccountEntity;

  static isVerified({
    phoneVerifiedAt,
    emailVerifiedAt,
    revokeVerificationSince,
  }: AccountInfoEntity): boolean {
    if (
      (!emailVerifiedAt || emailVerifiedAt.getTime() > Date.now()) &&
      (!phoneVerifiedAt || phoneVerifiedAt.getTime() > Date.now())
    ) {
      return false;
    }
    if (
      revokeVerificationSince &&
      Date.now() > revokeVerificationSince.getTime() + MS_IN_DAY * 3
    ) {
      return false;
    }

    return true;
  }
}
