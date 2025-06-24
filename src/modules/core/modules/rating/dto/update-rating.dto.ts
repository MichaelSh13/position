import { IsString } from 'class-validator';

export class UpdateRatingDto {
  @IsString()
  comment: string;
}
