import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateJobApplicationDto {
  @ApiProperty({ type: String })
  @IsString()
  resume: string;

  @ApiProperty({ required: false, type: String })
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiProperty({ isArray: true, type: String, required: false })
  @IsOptional()
  @IsString({ each: true })
  conditions?: string[];
}
