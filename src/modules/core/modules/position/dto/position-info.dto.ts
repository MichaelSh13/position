import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

import { PositionEntity } from '../entities/position.entity';

// TODO: Remove this dto and put fields right into entity.
export class PositionInfoDto extends PositionEntity {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  jobApplicationCount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  appliedAccountId?: string;
}
