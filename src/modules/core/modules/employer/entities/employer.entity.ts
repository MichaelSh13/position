import { CustomBaseEntity } from 'src/shared/models/custom-base.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

import { AccountEntity } from '../../account/entities/account.entity';
import { PositionEntity } from '../../position/entities/position.entity';

@Entity({ name: 'employer' })
export class EmployerEntity extends CustomBaseEntity {
  @Column('timestamp', {
    nullable: true,
  })
  verifiedAt?: Date;

  @Column('uuid', { unique: true })
  accountId: string;

  @OneToOne(() => AccountEntity, (acc) => acc.employer)
  @JoinColumn({ name: 'accountId' })
  account?: AccountEntity;

  @OneToMany(() => PositionEntity, (position) => position.employer)
  positions?: PositionEntity[];

  static isVerified(
    employer?: EmployerEntity,
    account?: AccountEntity,
  ): boolean {
    const isAccountVerified = account
      ? AccountEntity.isVerified(account)
      : true;

    if (!employer?.verifiedAt || !isAccountVerified) {
      return false;
    }

    return true;
  }
}
