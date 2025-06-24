import { ApiProperty } from '@nestjs/swagger';
import { CustomBaseEntity } from 'src/shared/models/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AccountEntity } from '../../account/entities/account.entity';
import { EmployerEntity } from '../../employer/entities/employer.entity';

@Entity({ name: 'rating' })
export class RatingEntity extends CustomBaseEntity {
  @Column('integer')
  job: number;

  @Column('integer', {
    nullable: true,
  })
  salary?: number;

  @Column('integer', {
    nullable: true,
  })
  conditions?: number;

  @Column('varchar', {
    nullable: true,
  })
  comment?: string;

  @ApiProperty()
  @Column('uuid')
  accountId!: string;
  //
  @ManyToOne(() => AccountEntity, (account) => account.ratings)
  @JoinColumn({ name: 'accountId' })
  account?: AccountEntity;

  @ApiProperty()
  @Column('uuid')
  employerId!: string;
  //
  @ManyToOne(() => EmployerEntity, (employer) => employer.ratings)
  @JoinColumn({ name: 'employerId' })
  employer?: EmployerEntity;
}
