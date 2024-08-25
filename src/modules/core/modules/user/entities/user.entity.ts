import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { CustomBaseEntity } from 'src/entities/custom-base.entity';
import { PhoneNumber } from 'src/entities/phone-number.entity';
import { Column, Entity, ValueTransformer } from 'typeorm';

import { UserRoles } from '../consts/user-roles.enum';

class PhoneTransformer implements ValueTransformer {
  to(phone: { code: string; numbers: string } | null): string | null {
    return phone ? `${phone.code}-${phone.numbers}` : null;
  }

  from(value: string | null): { code: string; numbers: string } | null {
    if (!value) return null;
    const [code, numbers] = value.split('-');
    return { code, numbers };
  }
}

@Entity({ name: 'user' })
export class UserEntity extends CustomBaseEntity {
  @ApiProperty()
  @Column({
    type: 'varchar',
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: true,
    transformer: new PhoneTransformer(),
  })
  phone?: PhoneNumber | null;

  @ApiProperty({ maxLength: 200, nullable: true })
  @Column('varchar', { length: 200, nullable: true })
  name?: string;

  @ApiProperty({ enum: UserRoles, isArray: true, default: [UserRoles.USER] })
  @Column('enum', { enum: UserRoles, array: true, default: [UserRoles.USER] })
  roles: UserRoles[];

  @ApiProperty({ type: Boolean })
  @Exclude()
  @Column('boolean', {
    default: false,
  })
  complete: boolean;

  @ApiProperty({ nullable: true })
  @Column('varchar')
  @Exclude({ toPlainOnly: true })
  password?: string;
}
