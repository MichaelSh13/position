import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEmailOrPhone } from 'src/shared/validators/is-email-or-phone-validator';

import { CreateAccountDto } from '../../core/modules/account/dto/create-account.dto';

export class LoginDto extends PickType(CreateAccountDto, [
  'password',
] as const) {
  @ApiProperty()
  @IsEmailOrPhone()
  username: string;
}
