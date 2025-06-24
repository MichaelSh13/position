import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConversationEntity } from '../entities/conversation.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepository: Repository<ConversationEntity>,
  ) {}

  public async createConversation(jobApplicationId: string) {
    const existConversation = await this.conversationRepository.findOneBy({
      jobApplicationId,
    });
    if (existConversation) {
      throw new ConflictException('Conversation already exists.');
    }

    try {
      const conversation = await this.conversationRepository.save({
        jobApplicationId,
      });

      return conversation;
    } catch (_error) {
      // TODO: Logger
      throw new BadRequestException('Conversation not created.');
    }
  }

  public async getConversation(conversationId: string) {
    const conversation = await this.conversationRepository.findOneBy({
      id: conversationId,
    });
    if (!conversation) {
      throw new BadRequestException('Conversation not found.');
    }

    return conversation;
  }
}
