import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { User } from '@users/entities/user.entity';
import { Case } from '@cases/entities/case.entity';
import { DraftingTemplate } from './template.entity';

export enum GeneratedDocumentStatus {
  GENERATING = 'generating',
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FINALIZED = 'finalized',
  FILED = 'filed',
}

@Entity('generated_documents')
@Index(['templateId'])
@Index(['caseId'])
@Index(['status'])
// createdBy index is inherited from BaseEntity
export class GeneratedDocument extends BaseEntity {
  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'template_id', type: 'uuid' })
  templateId!: string;

  @ManyToOne(() => DraftingTemplate)
  @JoinColumn({ name: 'template_id' })
  template!: DraftingTemplate;

  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  caseId!: string;

  @ManyToOne(() => Case)
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({
    type: 'enum',
    enum: GeneratedDocumentStatus,
    default: GeneratedDocumentStatus.DRAFT,
  })
  status!: GeneratedDocumentStatus;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'jsonb', name: 'variable_values' })
  variableValues!: Record<string, unknown>;

  @Column({ type: 'text', array: true, default: '{}', name: 'included_clauses' })
  includedClauses!: string[];

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator!: User;

  @Column({ name: 'reviewer_id', type: 'uuid', nullable: true })
  reviewerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer!: User;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes!: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt!: Date;

  @Column({ name: 'finalized_at', type: 'timestamp', nullable: true })
  finalizedAt!: Date;

  @Column({ name: 'word_count', type: 'int', default: 0 })
  wordCount!: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;
}
