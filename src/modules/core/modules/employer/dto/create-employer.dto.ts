import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateEmployerDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  pass?: string;
}
