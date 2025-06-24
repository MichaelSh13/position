import { ApiProperty } from '@nestjs/swagger';
import { CustomBaseEntity } from 'src/shared/models/custom-base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

import { JobApplicationEntity } from '../../job-application/entities/job-application.entity';
import { MessageEntity } from '../../message/entities/message.entity';

@Entity({ name: 'conversation' })
export class ConversationEntity extends CustomBaseEntity {
  @ApiProperty()
  @Column('uuid', {
    unique: true,
  })
  jobApplicationId: string;
  //
  @OneToOne(() => JobApplicationEntity)
  @JoinColumn({ name: 'jobApplicationId' })
  jobApplication: JobApplicationEntity;

  @ApiProperty({ type: () => MessageEntity, isArray: true, nullable: true })
  @OneToMany(() => MessageEntity, (message) => message.conversation, {
    cascade: ['insert', 'remove', 'update'],
  })
  messages?: MessageEntity[];

  @ApiProperty({ required: false })
  @RelationId(
    (conversation: ConversationEntity) => conversation.lastMessageSent,
  )
  lastMessageSentId?: string;
  //
  @OneToOne(() => MessageEntity, { nullable: true })
  @JoinColumn({ name: 'lastMessageSentId' })
  lastMessageSent?: MessageEntity;

  @UpdateDateColumn({ name: 'updated_at' })
  lastMessageSentAt?: Date;
}
