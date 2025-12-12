import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from './case.entity';

@Entity('projects')
@Index(['caseId'])
@Index(['status'])
@Index(['dueDate'])
export class Project extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: [
      'not_started',
      'in_progress',
      'on_hold',
      'completed',
      'cancelled',
    ],
    default: 'not_started',
  })
  status: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  completedDate: Date;

  @Column({ type: 'integer', default: 0 })
  completionPercentage: number;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  })
  priority: string;

  @Column({ type: 'uuid', nullable: true })
  projectManagerId: string;

  @Column({ type: 'jsonb', nullable: true })
  assignedUsers: string[];

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedBudget: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualCost: number;

  @Column({ type: 'integer', default: 0 })
  estimatedHours: number;

  @Column({ type: 'integer', default: 0 })
  actualHours: number;

  @Column({ type: 'jsonb', nullable: true })
  milestones: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  deliverables: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => Case, (caseEntity) => caseEntity.projects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caseId' })
  case: Case;
}
