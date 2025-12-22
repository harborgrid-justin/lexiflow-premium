import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Conversation } from './conversation.entity';

@Entity('messages')
@Index(['conversationId'])
@Index(['senderId'])
@Index(['sentAt'])
@Index(['messageType'])
export class Message extends BaseEntity {
  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId!: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: Conversation;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    name: 'message_type',
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
  messageType!: string;

  @Column({ name: 'sent_at', type: 'timestamp' })
  sentAt!: Date;

  @Column({ name: 'edited_at', type: 'timestamp', nullable: true })
  editedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt!: Date;

  @Column({ name: 'is_edited', type: 'boolean', default: false })
  isEdited!: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @Column({ name: 'read_by', type: 'jsonb', nullable: true })
  readBy: Record<string, any>[];

  @Column({ name: 'read_count', type: 'integer', default: 0 })
  readCount!: number;

  @Column({ name: 'reply_to_id', type: 'uuid', nullable: true })
  replyToId!: string;

  @Column({ name: 'reply_to_content', type: 'text', nullable: true })
  replyToContent!: string;

  @Column({ name: 'forwarded_from_id', type: 'uuid', nullable: true })
  forwardedFromId!: string;

  @Column({ name: 'is_forwarded', type: 'boolean', default: false })
  isForwarded!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  attachments: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  mentions!: string[];

  @Column({ type: 'jsonb', nullable: true })
  reactions: Record<string, any>[];

  @Column({ name: 'is_pinned', type: 'boolean', default: false })
  isPinned!: boolean;

  @Column({ name: 'pinned_at', type: 'timestamp', nullable: true })
  pinnedAt!: Date;

  @Column({ name: 'pinned_by', type: 'uuid', nullable: true })
  pinnedBy!: string;

  @Column({ name: 'is_important', type: 'boolean', default: false })
  isImportant!: boolean;

  @Column({ name: 'is_system_message', type: 'boolean', default: false })
  isSystemMessage!: boolean;

  @Column({ name: 'system_message_type', type: 'varchar', length: 100, nullable: true })
  systemMessageType!: string;

  @Column({ name: 'link_previews', type: 'jsonb', nullable: true })
  linkPreviews: Record<string, any>[];
}
