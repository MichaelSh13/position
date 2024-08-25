import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CommonDto {
  @IsNumber()
  port: number;

  @IsString()
  @IsNotEmpty()
  apiLimit: string;
}
