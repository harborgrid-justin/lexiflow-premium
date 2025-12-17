import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
@Index(['entity'])
@Index(['timestamp'])
@Index(['entityId'])
export class AuditLog extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userName: string;

  @Column({
    type: 'enum',
    enum: [
      'create',
      'read',
      'update',
      'delete',
      'login',
      'logout',
      'access',
      'download',
      'upload',
      'export',
      'import',
      'approve',
      'reject',
      'submit',
      'archive',
      'restore',
      'share',
      'unshare',
      'other',
    ],
  })
  action: string;

  @Column({ type: 'varchar', length: 100 })
  entity: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  entityId: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  method: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  endpoint: string;

  @Column({ type: 'integer', nullable: true })
  statusCode: number;

  @Column({ type: 'jsonb', nullable: true })
  changes: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({
    type: 'enum',
    enum: ['success', 'failure', 'warning', 'info'],
    default: 'success',
  })
  result: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'text', nullable: true })
  stackTrace: string;

  @Column({ type: 'integer', nullable: true })
  duration: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sessionId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  requestId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  correlationId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  resource: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  resourceId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceType: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
  })
  severity: string;

  @Column({ type: 'boolean', default: false })
  requiresReview: boolean;

  @Column({ type: 'boolean', default: false })
  isReviewed: boolean;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Note: No foreign key relation to User table to allow audit logs
  // to persist even after users are deleted (audit trail integrity)
}
