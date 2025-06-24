import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from 'nest-casl';

import { ConversationsController } from './controllers/conversations.controller';
import { conversationPermissions } from './conversation.permission';
import { ConversationEntity } from './entities/conversation.entity';
import { ConversationService } from './services/conversation.service';

@Module({
  imports: [
    CaslModule.forFeature({ permissions: conversationPermissions }),
    TypeOrmModule.forFeature([ConversationEntity]),
  ],
  controllers: [ConversationsController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
