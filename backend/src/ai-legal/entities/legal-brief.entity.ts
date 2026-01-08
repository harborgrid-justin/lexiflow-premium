import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Matter } from '@matters/entities/matter.entity';

export enum BriefType {
  MOTION = 'MOTION',
  MEMORANDUM = 'MEMORANDUM',
  RESPONSE = 'RESPONSE',
  REPLY = 'REPLY',
  APPELLATE = 'APPELLATE',
  AMICUS = 'AMICUS',
  TRIAL = 'TRIAL',
  OTHER = 'OTHER',
}

export enum BriefStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  FILED = 'FILED',
  ARCHIVED = 'ARCHIVED',
}

export interface LegalArgument {
  id: string;
  heading: string;
  content: string;
  legalBasis: string[];
  strength: 'WEAK' | 'MODERATE' | 'STRONG';
  order: number;
}

export interface Citation {
  id: string;
  caseTitle: string;
  citation: string;
  jurisdiction: string;
  year: number;
  relevance: string;
  quotation?: string;
  page?: number;
}

@Entity('legal_briefs')
@Index(['matterId'])
@Index(['type'])
@Index(['status'])
@Index(['createdAt'])
export class LegalBrief extends BaseEntity {
  @Column({ name: 'matter_id', type: 'uuid' })
  @Index()
  matterId!: string;

  @ManyToOne(() => Matter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matter_id' })
  matter!: Matter;

  @Column({ type: 'varchar', length: 500 })
  title!: string;

  @Column({
    type: 'enum',
    enum: BriefType,
    default: BriefType.MEMORANDUM,
  })
  type!: BriefType;

  @Column({ type: 'jsonb' })
  arguments!: LegalArgument[];

  @Column({ type: 'jsonb' })
  citations!: Citation[];

  @Column({
    type: 'enum',
    enum: BriefStatus,
    default: BriefStatus.DRAFT,
  })
  status!: BriefStatus;

  @Column({ type: 'text' })
  introduction!: string;

  @Column({ type: 'text' })
  conclusion!: string;

  @Column({ name: 'statement_of_facts', type: 'text', nullable: true })
  statementOfFacts?: string;

  @Column({ name: 'procedural_history', type: 'text', nullable: true })
  proceduralHistory?: string;

  @Column({ name: 'legal_standard', type: 'text', nullable: true })
  legalStandard?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  jurisdiction?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  court?: string;

  @Column({ name: 'word_count', type: 'int', nullable: true })
  wordCount?: number;

  @Column({ name: 'page_count', type: 'int', nullable: true })
  pageCount?: number;

  @Column({ name: 'generation_date', type: 'timestamp with time zone' })
  generationDate!: Date;

  @Column({ name: 'model_used', type: 'varchar', length: 100 })
  modelUsed!: string;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy?: string;

  @Column({ name: 'reviewed_at', type: 'timestamp with time zone', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'filed_date', type: 'date', nullable: true })
  filedDate?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
