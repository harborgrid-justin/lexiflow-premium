import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Case } from '../../cases/entities/case.entity';

export enum PhaseType {
  INTAKE = 'Intake',
  INVESTIGATION = 'Investigation',
  PLEADING = 'Pleading',
  DISCOVERY = 'Discovery',
  MOTION_PRACTICE = 'Motion Practice',
  MEDIATION = 'Mediation',
  ARBITRATION = 'Arbitration',
  TRIAL_PREPARATION = 'Trial Preparation',
  TRIAL = 'Trial',
  POST_TRIAL = 'Post-Trial',
  APPEAL = 'Appeal',
  SETTLEMENT = 'Settlement',
  CLOSURE = 'Closure',
}

export enum PhaseStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold',
  CANCELLED = 'Cancelled',
}

@Entity('case_phases')
@Index(['caseId'])
@Index(['status'])
@Index(['startDate'])
export class CasePhase extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string;

  @Column({
    type: 'enum',
    enum: PhaseType,
    nullable: true,
  })
  type!: PhaseType;

  @Column({
    type: 'enum',
    enum: PhaseStatus,
    default: PhaseStatus.NOT_STARTED,
  })
  status!: PhaseStatus;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate!: Date;

  @Column({ name: 'expected_end_date', type: 'date', nullable: true })
  expectedEndDate?: Date;

  @Column({ name: 'order_index', type: 'int', default: 0 })
  orderIndex!: number;

  @Column({ name: 'completion_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage!: number;

  @Column({ type: 'text', nullable: true })
  objectives!: string;

  @Column({ type: 'text', nullable: true })
  deliverables!: string;

  @Column({ name: 'estimated_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedCost!: number;

  @Column({ name: 'actual_cost', type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualCost!: number;

  @Column({ name: 'estimated_hours', type: 'integer', default: 0 })
  estimatedHours!: number;

  @Column({ name: 'actual_hours', type: 'integer', default: 0 })
  actualHours!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

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
