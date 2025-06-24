import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { ConversationService } from '../services/conversation.service';

@ApiTags('Conversation')
@ApiSecurity('JWT-auth')
// TODO: Use enum instead of string: Routes.CONVERSATIONS;
@Controller('conversation')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationService) {}

  @Get('test/endpoint/check')
  test() {
    return;
  }

  @Get(':conversationId')
  async getConversation(
    @Param('conversationId', new ParseUUIDPipe()) conversationId: string,
  ) {
    return this.conversationsService.getConversation(conversationId);
  }
}
