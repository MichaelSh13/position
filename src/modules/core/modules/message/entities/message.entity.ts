import { ApiProperty } from '@nestjs/swagger';
import { CustomBaseEntity } from 'src/shared/models/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { ConversationEntity } from '../../conversation/entities/conversation.entity';

@Entity({ name: 'message' })
export class MessageEntity extends CustomBaseEntity {
  @ApiProperty()
  @Column('uuid')
  conversationId!: string;
  //
  @ApiProperty({ type: () => ConversationEntity, nullable: true })
  @ManyToOne(() => ConversationEntity, (account) => account.messages)
  @JoinColumn({ name: 'conversationId' })
  conversation?: ConversationEntity;
}
