import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { PortalUser } from './portal-user.entity';

@Entity('secure_messages')
@Index(['portalUserId'])
@Index(['matterId'])
@Index(['read'])
@Index(['sentAt'])
@Index(['messageType'])
@Index(['status'])
export class SecureMessage extends BaseEntity {
  @Column({ name: 'portal_user_id', type: 'uuid' })
  portalUserId!: string;

  @Column({ name: 'matter_id', type: 'uuid', nullable: true })
  matterId!: string;

  @Column({ type: 'varchar', length: 500 })
  subject!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments!: Array<{
    filename: string;
    url: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
  }>;

  @Column({ type: 'boolean', default: false })
  read!: boolean;

  @Column({ name: 'read_at', type: 'timestamp with time zone', nullable: true })
  readAt!: Date;

  @Column({ name: 'sent_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  sentAt!: Date;

  @Column({ name: 'sender_id', type: 'uuid', nullable: true })
  senderId!: string;

  @Column({ name: 'sender_type', type: 'enum', enum: ['client', 'attorney', 'staff', 'system'], default: 'client' })
  senderType!: string;

  @Column({ name: 'recipient_id', type: 'uuid', nullable: true })
  recipientId!: string;

  @Column({ name: 'recipient_type', type: 'enum', enum: ['client', 'attorney', 'staff'], nullable: true })
  recipientType!: string;

  @Column({
    name: 'message_type',
    type: 'enum',
    enum: ['general', 'case_update', 'document_request', 'appointment', 'billing', 'urgent'],
    default: 'general',
  })
  messageType!: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'sent', 'delivered', 'read', 'archived'],
    default: 'sent',
  })
  status!: string;

  @Column({ name: 'parent_message_id', type: 'uuid', nullable: true })
  parentMessageId!: string;

  @Column({ name: 'thread_id', type: 'uuid', nullable: true })
  threadId!: string;

  @Column({ name: 'is_encrypted', type: 'boolean', default: true })
  isEncrypted!: boolean;

  @Column({ name: 'encryption_key_id', type: 'varchar', length: 255, nullable: true })
  encryptionKeyId!: string;

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  isArchived!: boolean;

  @Column({ name: 'archived_at', type: 'timestamp with time zone', nullable: true })
  archivedAt!: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  // Relations
  @ManyToOne(() => PortalUser, (user) => user.messages, { nullable: false })
  @JoinColumn({ name: 'portal_user_id' })
  portalUser!: PortalUser;
}
