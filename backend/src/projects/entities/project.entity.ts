import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Case } from '@cases/entities/case.entity';

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
@Index(['caseId'])
@Index(['status'])
@Index(['dueDate'])
export class Project extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  caseId?: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'case_id' })
  case?: Case;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.NOT_STARTED,
  })
  status!: ProjectStatus;

  @Column({
    type: 'enum',
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM,
  })
  priority!: ProjectPriority;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: Date;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ name: 'completed_date', type: 'date', nullable: true })
  completedDate?: Date;

  @Column({ name: 'project_manager_id', type: 'uuid', nullable: true })
  projectManagerId?: string;

  @Column({ name: 'assigned_team_id', type: 'uuid', nullable: true })
  assignedTeamId?: string;

  @Column({ name: 'completion_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage!: number;

  @Column({ name: 'estimated_hours', type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedHours?: number;

  @Column({ name: 'actual_hours', type: 'decimal', precision: 12, scale: 2, nullable: true })
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
  metadata?: Record<string, unknown>;
}
