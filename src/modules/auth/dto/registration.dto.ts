import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { Match } from 'src/validators/match.validation';

import { CreateUserDto } from '../../core/modules/user/dto/create-user.dto';

export class RegistrationDto extends PickType(CreateUserDto, [
  'email',
  'password',
] as const) {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Match('password', { message: 'Password not match.' })
  passwordConfirm!: string;
}
