import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RedisDto {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsNumber()
  port: number;

  @IsNumber()
  ttl: number;
}
