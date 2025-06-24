import { Module } from '@nestjs/common';

import { AccountModule } from './modules/account/account.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { EmployerModule } from './modules/employer/employer.module';
import { JobApplicationModule } from './modules/job-application/job-application.module';
import { MessageModule } from './modules/message/message.module';
import { PositionModule } from './modules/position/position.module';
import { RatingModule } from './modules/rating/rating.module';

@Module({
  imports: [
    AccountModule,
    EmployerModule,
    PositionModule,
    JobApplicationModule,
    RatingModule,
    ConversationModule,
    MessageModule,
  ],
})
export class CoreModule {}
