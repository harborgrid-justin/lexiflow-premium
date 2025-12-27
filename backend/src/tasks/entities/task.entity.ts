import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { TaskStatus, TaskPriority } from '@tasks/dto/create-task.dto';
import { Case } from '@cases/entities/case.entity';

@Entity('tasks')
@Index(['caseId'])
@Index(['assignedTo'])
@Index(['status'])
export class Task extends BaseEntity {
  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status!: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority!: TaskPriority;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate!: Date;

  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  caseId!: string;

  @ManyToOne(() => Case, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo!: string;

  @Column({ name: 'parent_task_id', type: 'uuid', nullable: true })
  parentTaskId!: string;

  @Column({ type: 'simple-array', nullable: true })
  tags!: string[];

  @Column({ name: 'estimated_hours', type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedHours!: number;

  @Column({ name: 'actual_hours', type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualHours!: number;

  @Column({ name: 'completion_percentage', type: 'int', default: 0 })
  completionPercentage!: number;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string;
}
