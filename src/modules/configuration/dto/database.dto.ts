import { IsNumber, IsString, MinLength } from 'class-validator';

export class DatabaseDto {
  @IsString()
  @MinLength(1)
  host: string;

  @IsNumber()
  port: number;

  @IsString()
  @MinLength(1)
  username: string;

  @IsString()
  @MinLength(1)
  password: string;

  @IsString()
  @MinLength(1)
  database: string;
}
