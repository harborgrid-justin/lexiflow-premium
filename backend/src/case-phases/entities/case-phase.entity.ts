import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../entities/base.entity';
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
export class CasePhase extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: PhaseType,
  })
  type: PhaseType;

  @Column({
    type: 'enum',
    enum: PhaseStatus,
    default: PhaseStatus.NOT_STARTED,
  })
  status: PhaseStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedEndDate?: Date;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage: number;

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
  metadata?: Record<string, any>;
}
