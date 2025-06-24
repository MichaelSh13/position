import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class GetJobApplicationsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsUUID(undefined, { each: true })
  positionIds?: string[];
}
