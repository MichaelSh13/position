import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from 'nest-casl';

import { RatingController } from './controllers/rating.controller';
import { RatingEntity } from './entities/rating.entity';
import { ratingPermissions } from './rating.permission';
import { RatingService } from './services/rating.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RatingEntity]),
    CaslModule.forFeature({ permissions: ratingPermissions }),
  ],
  controllers: [RatingController],
  providers: [RatingService],
  exports: [RatingService],
})
export class RatingModule {}
