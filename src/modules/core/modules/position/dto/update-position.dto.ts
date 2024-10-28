import { PartialType, PickType } from '@nestjs/swagger';

import { CreatePositionDto } from './create-position.dto';

export class UpdatePositionDto extends PartialType(
  PickType(CreatePositionDto, ['title', 'description'] as const),
) {}
