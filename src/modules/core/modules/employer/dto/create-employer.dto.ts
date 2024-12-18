import { IsOptional, IsString } from 'class-validator';

export class CreateEmployerDto {
  @IsOptional()
  @IsString()
  pass?: string;
}
