import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from './case.entity';

@Entity('case_phases')
@Index(['caseId'])
@Index(['status'])
@Index(['startDate'])
export class CasePhase extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  phaseName: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: [
      'not_started',
      'in_progress',
      'completed',
      'on_hold',
      'cancelled',
    ],
    default: 'not_started',
  })
  status: string;

  @Column({ type: 'integer', default: 0 })
  completionPercentage: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  objectives: string;

  @Column({ type: 'text', nullable: true })
  deliverables: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualCost: number;

  @Column({ type: 'integer', default: 0 })
  estimatedHours: number;

  @Column({ type: 'integer', default: 0 })
  actualHours: number;

  @Column({ type: 'jsonb', nullable: true })
  milestones: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations
  @ManyToOne(() => Case, (caseEntity) => caseEntity.phases, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caseId' })
  case: Case;
}
