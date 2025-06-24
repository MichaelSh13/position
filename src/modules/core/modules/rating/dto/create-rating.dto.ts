import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  job: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  salary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  conditions?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
