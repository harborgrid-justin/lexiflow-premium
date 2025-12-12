import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Conversation } from './conversation.entity';

@Entity('messages')
@Index(['conversationId'])
@Index(['senderId'])
@Index(['sentAt'])
@Index(['messageType'])
export class Message extends BaseEntity {
  @Column({ type: 'uuid' })
  conversationId: string;

  @Column({ type: 'uuid' })
  senderId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: [
      'text',
      'file',
      'image',
      'video',
      'audio',
      'document',
      'link',
      'system',
      'notification',
    ],
    default: 'text',
  })
  messageType: string;

  @Column({ type: 'timestamp' })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  editedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'jsonb', nullable: true })
  readBy: Record<string, any>[];

  @Column({ type: 'integer', default: 0 })
  readCount: number;

  @Column({ type: 'uuid', nullable: true })
  replyToId: string;

  @Column({ type: 'text', nullable: true })
  replyToContent: string;

  @Column({ type: 'uuid', nullable: true })
  forwardedFromId: string;

  @Column({ type: 'boolean', default: false })
  isForwarded: boolean;

  @Column({ type: 'jsonb', nullable: true })
  attachments: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  mentions: string[];

  @Column({ type: 'jsonb', nullable: true })
  reactions: Record<string, any>[];

  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ type: 'timestamp', nullable: true })
  pinnedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  pinnedBy: string;

  @Column({ type: 'boolean', default: false })
  isImportant: boolean;

  @Column({ type: 'boolean', default: false })
  isSystemMessage: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  systemMessageType: string;

  @Column({ type: 'jsonb', nullable: true })
  linkPreviews: Record<string, any>[];

  @Column({ type: 'text', nullable: true })
  quotedText: string;

  @Column({ type: 'uuid', nullable: true })
  quotedMessageId: string;

  @Column({ type: 'integer', default: 0 })
  threadCount: number;

  @Column({ type: 'uuid', nullable: true })
  threadId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;
}
