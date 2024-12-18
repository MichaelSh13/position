import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from 'nest-casl';

import { PositionModule } from '../position/position.module';
import { JobApplicationController } from './controllers/job-application.controller';
import { JobApplicationEntity } from './entities/job-application.entity';
import { JobApplicationHandlerService } from './handlers/job-application.handler.service';
import { jobApplicationPermissions } from './job-application.permission';
import { JobApplicationJobService } from './jobs/job-application.job.service';
import { JobApplicationService } from './services/job-application.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplicationEntity]),
    CaslModule.forFeature({ permissions: jobApplicationPermissions }),
    PositionModule,
  ],
  controllers: [JobApplicationController],
  providers: [
    JobApplicationService,
    JobApplicationJobService,
    JobApplicationHandlerService,
  ],
  exports: [JobApplicationService],
})
export class JobApplicationModule {}
