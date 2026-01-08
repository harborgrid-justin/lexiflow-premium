import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { PortalUser } from './portal-user.entity';

@Entity('client_notifications')
@Index(['portalUserId'])
@Index(['read'])
@Index(['notificationType'])
@Index(['priority'])
@Index(['sentAt'])
@Index(['expiresAt'])
export class ClientNotification extends BaseEntity {
  @Column({ name: 'portal_user_id', type: 'uuid' })
  portalUserId!: string;

  @Column({
    name: 'notification_type',
    type: 'enum',
    enum: [
      'message',
      'document_shared',
      'appointment_scheduled',
      'appointment_reminder',
      'appointment_cancelled',
      'invoice_generated',
      'payment_received',
      'payment_due',
      'case_update',
      'deadline_approaching',
      'system_announcement',
      'account_security',
    ],
  })
  notificationType!: string;

  @Column({ type: 'varchar', length: 500 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'boolean', default: false })
  read!: boolean;

  @Column({ name: 'read_at', type: 'timestamp with time zone', nullable: true })
  readAt!: Date;

  @Column({ name: 'sent_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  sentAt!: Date;

  @Column({
    type: 'enum',
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  })
  priority!: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'sent', 'delivered', 'failed', 'expired'],
    default: 'sent',
  })
  status!: string;

  @Column({ name: 'action_url', type: 'text', nullable: true })
  actionUrl!: string;

  @Column({ name: 'action_text', type: 'varchar', length: 100, nullable: true })
  actionText!: string;

  @Column({ name: 'related_entity_id', type: 'uuid', nullable: true })
  relatedEntityId!: string;

  @Column({ name: 'related_entity_type', type: 'varchar', length: 100, nullable: true })
  relatedEntityType!: string;

  @Column({ name: 'icon', type: 'varchar', length: 50, nullable: true })
  icon!: string;

  @Column({ name: 'color', type: 'varchar', length: 50, nullable: true })
  color!: string;

  @Column({ name: 'expires_at', type: 'timestamp with time zone', nullable: true })
  expiresAt!: Date;

  @Column({ name: 'is_dismissible', type: 'boolean', default: true })
  isDismissible!: boolean;

  @Column({ name: 'dismissed_at', type: 'timestamp with time zone', nullable: true })
  dismissedAt!: Date;

  @Column({ name: 'send_email', type: 'boolean', default: false })
  sendEmail!: boolean;

  @Column({ name: 'email_sent', type: 'boolean', default: false })
  emailSent!: boolean;

  @Column({ name: 'email_sent_at', type: 'timestamp with time zone', nullable: true })
  emailSentAt!: Date;

  @Column({ name: 'send_sms', type: 'boolean', default: false })
  sendSms!: boolean;

  @Column({ name: 'sms_sent', type: 'boolean', default: false })
  smsSent!: boolean;

  @Column({ name: 'sms_sent_at', type: 'timestamp with time zone', nullable: true })
  smsSentAt!: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  // Relations
  @ManyToOne(() => PortalUser, (user) => user.notifications, { nullable: false })
  @JoinColumn({ name: 'portal_user_id' })
  portalUser!: PortalUser;
}
