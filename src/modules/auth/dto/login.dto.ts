import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

import { CreateAccountDto } from '../../core/modules/account/dto/create-account.dto';

export class LoginDto extends PickType(CreateAccountDto, [
  'username',
] as const) {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  password: string;
}
