import { Entity, Column, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Message } from './message.entity';
import { Case } from '../../cases/entities/case.entity';

@Entity('conversations')
@Index(['conversationType'])
@Index(['isActive'])
export class Conversation extends BaseEntity {
  @Column({ type: 'varchar', length: 500, nullable: true })
  title: string;

  @Column({
    name: 'conversation_type',
    type: 'enum',
    enum: ['direct', 'group', 'case_discussion', 'team_chat', 'client_communication'],
    default: 'direct',
  })
  conversationType: string;

  @Column({ type: 'jsonb' })
  participants: string[];

  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  caseId: string;

  @ManyToOne(() => Case, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ name: 'is_muted', type: 'boolean', default: false })
  isMuted: boolean;

  @Column({ name: 'last_message_id', type: 'uuid', nullable: true })
  lastMessageId: string;

  @Column({ name: 'last_message_text', type: 'text', nullable: true })
  lastMessageText: string;

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @Column({ name: 'last_message_by', type: 'uuid', nullable: true })
  lastMessageBy: string;

  @Column({ name: 'unread_count', type: 'jsonb', nullable: true })
  unreadCount: Record<string, number>;

  @Column({ name: 'pinned_message_id', type: 'uuid', nullable: true })
  pinnedMessageId: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 255, nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'message_count', type: 'int', default: 0 })
  messageCount: number;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}
