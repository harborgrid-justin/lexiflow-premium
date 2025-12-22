import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';

@Entity('notifications')
@Index(['userId'])
@Index(['notificationType'])
@Index(['isRead'])
@Index(['priority'])
@Index(['createdAt'])
export class Notification extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({
    name: 'notification_type',
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
  notificationType!: string;

  @Column({ type: 'varchar', length: 500 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead!: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt!: Date;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  priority!: string;

  @Column({ name: 'related_entity_id', type: 'uuid', nullable: true })
  relatedEntityId!: string;

  @Column({ name: 'related_entity_type', type: 'varchar', length: 100, nullable: true })
  relatedEntityType!: string;

  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  caseId!: string;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId!: string;

  @Column({ name: 'document_id', type: 'uuid', nullable: true })
  documentId!: string;

  @Column({ name: 'triggered_by', type: 'uuid', nullable: true })
  triggeredBy!: string;

  @Column({ name: 'action_url', type: 'varchar', length: 500, nullable: true })
  actionUrl!: string;

  @Column({ name: 'action_label', type: 'varchar', length: 100, nullable: true })
  actionLabel!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  color!: string;

  @Column({ name: 'requires_action', type: 'boolean', default: false })
  requiresAction!: boolean;

  @Column({ name: 'action_taken', type: 'boolean', default: false })
  actionTaken!: boolean;

  @Column({ name: 'action_taken_at', type: 'timestamp', nullable: true })
  actionTakenAt!: Date;

  @Column({ name: 'expires_at', type: 'date', nullable: true })
  expiresAt!: Date;

  @Column({ name: 'is_expired', type: 'boolean', default: false })
  isExpired!: boolean;

  @Column({ name: 'is_dismissed', type: 'boolean', default: false })
  isDismissed!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;
}
