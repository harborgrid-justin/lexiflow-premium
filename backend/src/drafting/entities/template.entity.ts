import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { User } from '../../users/entities/user.entity';

export enum TemplateCategory {
  COMPLAINT = 'complaint',
  ANSWER = 'answer',
  MOTION = 'motion',
  BRIEF = 'brief',
  DISCOVERY = 'discovery',
  CONTRACT = 'contract',
  LETTER = 'letter',
  MEMO = 'memo',
  ORDER = 'order',
  PLEADING = 'pleading',
  NOTICE = 'notice',
  STIPULATION = 'stipulation',
  AFFIDAVIT = 'affidavit',
  DECLARATION = 'declaration',
  OTHER = 'other',
}

export enum TemplateStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DEPRECATED = 'deprecated',
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select' | 'multi-select' | 'boolean' | 'case-data' | 'party' | 'attorney';
  required: boolean;
  defaultValue?: string;
  options?: string[];
  description?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface ClauseReference {
  clauseId: string;
  position: number;
  isOptional: boolean;
  condition?: string;
}

@Entity('drafting_templates')
@Index(['category'])
@Index(['status'])
@Index(['isPublic'])
@Index(['jurisdiction'])
export class DraftingTemplate extends BaseEntity {
  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({
    type: 'enum',
    enum: TemplateCategory,
  })
  category!: TemplateCategory;

  @Column({
    type: 'enum',
    enum: TemplateStatus,
    default: TemplateStatus.DRAFT,
  })
  status!: TemplateStatus;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'jsonb', default: [] })
  variables!: TemplateVariable[];

  @Column({ type: 'jsonb', nullable: true, name: 'clause_references' })
  clauseReferences!: ClauseReference[];

  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @Column({ name: 'jurisdiction', type: 'varchar', length: 200, nullable: true })
  jurisdiction!: string;

  @Column({ name: 'practice_area', type: 'varchar', length: 200, nullable: true })
  practiceArea!: string;

  @Column({ name: 'court_type', type: 'varchar', length: 100, nullable: true })
  courtType!: string;

  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic!: boolean;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator!: User;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount!: number;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt!: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  version!: string;

  @Column({ name: 'parent_template_id', type: 'uuid', nullable: true })
  parentTemplateId!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;
}
