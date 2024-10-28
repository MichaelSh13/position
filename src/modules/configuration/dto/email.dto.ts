import { IsString } from 'class-validator';

export class EmailDto {
  @IsString()
  user: string;

  @IsString()
  password: string;
}
