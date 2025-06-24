import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AccessGuard, Actions, UseAbility } from 'nest-casl';
import { AccountData } from 'src/modules/auth/decorators/account-data.decorator';

import { AccountEntity } from '../../account/entities/account.entity';
import { CreateRatingDto } from '../dto/create-rating.dto';
import { UpdateRatingDto } from '../dto/update-rating.dto';
import { RatingEntity } from '../entities/rating.entity';
import { RatingService } from '../services/rating.service';

@ApiTags('Rating')
@ApiSecurity('JWT-auth')
@Controller()
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Get('employer/:employerId/rating')
  @UseGuards(AccessGuard)
  @UseAbility(Actions.read, RatingEntity)
  async getEmployerRatings(
    @Param('employerId', new ParseUUIDPipe()) employerId: string,
  ): Promise<RatingEntity[]> {
    return this.ratingService.getEmployerRatings(employerId);
  }

  @Get('rating/:ratingId')
  @UseGuards(AccessGuard)
  @UseAbility(Actions.read, RatingEntity)
  getRating(
    @Param('ratingId', new ParseUUIDPipe()) ratingId: string,
  ): Promise<RatingEntity> {
    return this.ratingService.getRating(ratingId);
  }

  @Post('employer/:employerId/rating')
  @UseGuards(AccessGuard)
  @UseAbility(Actions.create, RatingEntity)
  create(
    @Body() createRatingData: CreateRatingDto,
    @Param('employerId', new ParseUUIDPipe()) employerId: string,
    @AccountData() account: AccountEntity,
  ) {
    return this.ratingService.create(employerId, createRatingData, account.id);
  }

  @Patch('rating/:ratingId')
  @UseGuards(AccessGuard)
  @UseAbility(Actions.update, RatingEntity)
  update(
    @Param('ratingId', new ParseUUIDPipe()) ratingId: string,
    @Body() updateRatingData: UpdateRatingDto,
  ) {
    return this.ratingService.update(ratingId, updateRatingData);
  }
}
