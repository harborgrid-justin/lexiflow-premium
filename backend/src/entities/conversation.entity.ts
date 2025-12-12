import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Message } from './message.entity';

@Entity('conversations')
@Index(['conversationType'])
@Index(['isActive'])
export class Conversation extends BaseEntity {
  @Column({ type: 'varchar', length: 500, nullable: true })
  title: string;

  @Column({
    type: 'enum',
    enum: ['direct', 'group', 'case_discussion', 'team_chat', 'client_communication'],
    default: 'direct',
  })
  conversationType: string;

  @Column({ type: 'jsonb' })
  participants: string[];

  @Column({ type: 'uuid', nullable: true })
  caseId: string;

  @Column({ type: 'uuid', nullable: true })
  projectId: string;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'boolean', default: false })
  isMuted: boolean;

  @Column({ type: 'uuid', nullable: true })
  lastMessageId: string;

  @Column({ type: 'text', nullable: true })
  lastMessageText: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @Column({ type: 'uuid', nullable: true })
  lastMessageBy: string;

  @Column({ type: 'integer', default: 0 })
  messageCount: number;

  @Column({ type: 'integer', default: 0 })
  unreadCount: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  admins: string[];

  @Column({ type: 'jsonb', nullable: true })
  mutedBy: string[];

  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ type: 'jsonb', nullable: true })
  pinnedBy: string[];

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @OneToMany(() => Message, (message) => message.conversation, { cascade: true })
  messages: Message[];
}
