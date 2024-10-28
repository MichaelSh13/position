import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { IsEmailOrPhone } from 'src/shared/validators/is-email-or-phone-validator';

export class CreateAccountDto {
  @ApiProperty({ description: 'Email or phone.' })
  @IsEmailOrPhone({ withCode: true })
  username: string;

  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak.',
  })
  password: string;
}
