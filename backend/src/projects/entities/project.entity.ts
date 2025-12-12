import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../entities/base.entity';
import { Case } from '../../cases/entities/case.entity';

export enum ProjectStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum ProjectPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

@Entity('projects')
export class Project extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  caseId?: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'caseId' })
  case?: Case;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.NOT_STARTED,
  })
  status: ProjectStatus;

  @Column({
    type: 'enum',
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM,
  })
  priority: ProjectPriority;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ type: 'date', nullable: true })
  completedDate?: Date;

  @Column({ type: 'uuid', nullable: true })
  projectManagerId?: string;

  @Column({ type: 'uuid', nullable: true })
  assignedTeamId?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedHours?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  actualHours?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  tasks?: Array<{
    id: string;
    name: string;
    assignedTo?: string;
    status: string;
    dueDate?: Date;
    completedDate?: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  milestones?: Array<{
    name: string;
    dueDate?: Date;
    completedDate?: Date;
    status: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
