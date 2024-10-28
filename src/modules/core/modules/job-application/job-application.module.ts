import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from 'nest-casl';

import { JobApplicationController } from './controllers/job-application.controller';
import { JobApplicationEntity } from './entities/job-application.entity';
import { jobApplicationPermissions } from './job-application.permission';
import { JobApplicationService } from './services/job-application.service';
import { PositionModule } from '../position/position.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplicationEntity]),
    CaslModule.forFeature({ permissions: jobApplicationPermissions }),
    PositionModule,
  ],
  controllers: [JobApplicationController],
  providers: [JobApplicationService],
  exports: [JobApplicationService],
})
export class JobApplicationModule {}
