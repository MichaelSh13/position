import { ApiProperty } from '@nestjs/swagger';
import { MS_IN_DAY } from 'src/shared/consts/time.const';
import { CustomBaseEntity } from 'src/shared/models/custom-base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { EmployerEntity } from './employer.entity';

@Entity({ name: 'employer-info' })
export class EmployerInfoEntity extends CustomBaseEntity {
  // TODO: Create just to have some checking identify. Use real data, e.g. passport data...
  @ApiProperty()
  @Column('varchar', {
    nullable: true,
  })
  pass?: string | null;

  @ApiProperty({ type: Date })
  @Column('timestamp', {
    nullable: true,
  })
  passVerifiedAt?: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  @Column('timestamp with time zone', {
    nullable: true,
  })
  revokeVerificationSince?: Date | null;

  @ApiProperty()
  @Column('uuid', { unique: true })
  employerId: string;

  @ApiProperty({ type: () => EmployerEntity, nullable: true })
  @OneToOne(() => EmployerEntity, (acc) => acc.info)
  @JoinColumn({ name: 'employerId' })
  employer?: EmployerEntity;

  static isVerified({
    pass,
    passVerifiedAt,
    revokeVerificationSince,
  }: EmployerInfoEntity): boolean {
    if (!pass) {
      return false;
    }
    if (passVerifiedAt && passVerifiedAt.getTime() > Date.now()) {
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
