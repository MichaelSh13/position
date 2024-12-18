import { ApiProperty } from '@nestjs/swagger';
import { AccountEntity } from 'src/modules/core/modules/account/entities/account.entity';

export class PayloadAccount {
  @ApiProperty({ type: () => AccountEntity })
  account: AccountEntity;

  @ApiProperty()
  iat: number;

  @ApiProperty()
  exp: number;
}
