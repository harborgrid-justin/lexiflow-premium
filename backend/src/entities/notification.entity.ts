import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('notifications')
@Index(['userId'])
@Index(['notificationType'])
@Index(['isRead'])
@Index(['priority'])
@Index(['createdAt'])
export class Notification extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: [
      'case_update',
      'deadline_reminder',
      'task_assigned',
      'document_shared',
      'message_received',
      'mention',
      'approval_required',
      'system_alert',
      'billing',
      'court_date',
      'discovery_deadline',
      'motion_filed',
      'other',
    ],
  })
  notificationType: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  priority: string;

  @Column({ type: 'uuid', nullable: true })
  relatedEntityId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  relatedEntityType: string;

  @Column({ type: 'uuid', nullable: true })
  caseId: string;

  @Column({ type: 'uuid', nullable: true })
  projectId: string;

  @Column({ type: 'uuid', nullable: true })
  documentId: string;

  @Column({ type: 'uuid', nullable: true })
  triggeredBy: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  actionUrl: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  actionLabel: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  color: string;

  @Column({ type: 'boolean', default: false })
  requiresAction: boolean;

  @Column({ type: 'boolean', default: false })
  actionTaken: boolean;

  @Column({ type: 'timestamp', nullable: true })
  actionTakenAt: Date;

  @Column({ type: 'date', nullable: true })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isExpired: boolean;

  @Column({ type: 'boolean', default: false })
  isDismissed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  dismissedAt: Date;

  @Column({ type: 'boolean', default: true })
  emailSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailSentAt: Date;

  @Column({ type: 'boolean', default: false })
  pushSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  pushSentAt: Date;

  @Column({ type: 'boolean', default: false })
  smsSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  smsSentAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
