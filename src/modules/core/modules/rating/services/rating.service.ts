import {
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateRatingDto } from '../dto/create-rating.dto';
import { UpdateRatingDto } from '../dto/update-rating.dto';
import { RatingEntity } from '../entities/rating.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(RatingEntity)
    private readonly ratingRepository: Repository<RatingEntity>,
  ) {}

  getEmployerRatings(employerId: string): Promise<RatingEntity[]> {
    return this.ratingRepository.findBy({
      employerId,
    });
  }

  async getRating(ratingId: string): Promise<RatingEntity> {
    const rating = await this.ratingRepository.findOneBy({ id: ratingId });
    if (!rating) {
      throw new NotFoundException('Rating not found.');
    }

    return rating;
  }

  async create(
    employerId: string,
    { job, comment, conditions, salary }: CreateRatingDto,
    accountId: string,
  ): Promise<RatingEntity> {
    const existingRating = await this.ratingRepository.findOneBy({
      employerId,
      accountId,
    });
    if (existingRating) {
      throw new NotFoundException('You already set rating.');
    }

    const ratingInst = this.ratingRepository.create({
      job,
      comment,
      conditions,
      salary,
      employerId,
      accountId,
    });
    const rating = await this.ratingRepository.save(ratingInst);

    return rating;
  }

  async update(
    ratingId: string,
    { comment }: UpdateRatingDto,
  ): Promise<RatingEntity> {
    const rating = await this.getRating(ratingId);

    const { affected } = await this.ratingRepository.update(ratingId, {
      comment,
    });
    if (!affected) {
      // TODO: error
      throw new NotImplementedException('Not updated.');
    }

    rating.comment = comment;

    return rating;
  }
}
