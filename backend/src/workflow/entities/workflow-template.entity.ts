import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { WorkflowCategory } from '../dto/create-workflow-template.dto';

@Entity('workflow_templates')
export class WorkflowTemplate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'enum', enum: WorkflowCategory })
  category!: WorkflowCategory;

  @Column({ type: 'json' })
  stages!: Array<{
    name: string;
    description?: string;
    order: number;
    durationDays?: number;
  }>;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy!: string;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
