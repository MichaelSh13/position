import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from 'nest-casl';

import { PositionController } from './controllers/position.controller';
import { PositionEntity } from './entities/position.entity';
import { positionPermissions } from './position.permission';
import { PositionService } from './services/position.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PositionEntity]),
    CaslModule.forFeature({ permissions: positionPermissions }),
  ],
  controllers: [PositionController],
  providers: [PositionService],
  exports: [PositionService],
})
export class PositionModule {}
