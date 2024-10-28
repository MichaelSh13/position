import { Module } from '@nestjs/common';

import { AccountModule } from './modules/account/account.module';
import { EmployerModule } from './modules/employer/employer.module';
import { JobApplicationModule } from './modules/job-application/job-application.module';
import { PositionModule } from './modules/position/position.module';

@Module({
  imports: [
    AccountModule,
    EmployerModule,
    PositionModule,
    JobApplicationModule,
  ],
})
export class CoreModule {}
