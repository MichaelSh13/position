import { IsOptional, IsString, IsUUID } from 'class-validator';

export class GetJobApplicationsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID(undefined, { each: true })
  positionIds?: string[];
}
