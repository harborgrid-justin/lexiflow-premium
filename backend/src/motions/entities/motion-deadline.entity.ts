import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../entities/base.entity';
import { Motion } from './motion.entity';

export enum DeadlineType {
  FILING = 'Filing',
  RESPONSE = 'Response',
  REPLY = 'Reply',
  HEARING = 'Hearing',
  DECISION = 'Decision',
  APPEAL = 'Appeal',
  CUSTOM = 'Custom',
}

export enum DeadlineStatus {
  UPCOMING = 'Upcoming',
  DUE_SOON = 'Due Soon',
  OVERDUE = 'Overdue',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

@Entity('motion_deadlines')
export class MotionDeadline extends BaseEntity {
  @Column({ type: 'uuid' })
  motionId: string;

  @ManyToOne(() => Motion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'motionId' })
  motion: Motion;

  @Column({
    type: 'enum',
    enum: DeadlineType,
  })
  type: DeadlineType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: DeadlineStatus,
    default: DeadlineStatus.UPCOMING,
  })
  status: DeadlineStatus;

  @Column({ type: 'uuid', nullable: true })
  assignedToUserId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assignedToUserName?: string;

  @Column({ type: 'int', default: 0 })
  reminderDaysBefore: number;

  @Column({ type: 'timestamp', nullable: true })
  completedDate?: Date;

  @Column({ type: 'uuid', nullable: true })
  completedByUserId?: string;

  @Column({ type: 'text', nullable: true })
  completionNotes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
