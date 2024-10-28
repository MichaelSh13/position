import { CreateAccountDto } from '../../core/modules/account/dto/create-account.dto';

export class RegistrationDto extends CreateAccountDto {
  // @ApiProperty()
  // @IsString()
  // @MinLength(4)
  // @MaxLength(20)
  // @Match('password', { message: 'Password not match.' })
  // passwordConfirm!: string;
}
