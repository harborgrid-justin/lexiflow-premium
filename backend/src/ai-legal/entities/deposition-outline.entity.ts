import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Matter } from '@matters/entities/matter.entity';

export interface DepositionTopic {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedTimeMinutes: number;
  order: number;
  subtopics?: string[];
}

export interface DepositionQuestion {
  id: string;
  topicId: string;
  question: string;
  followUpQuestions?: string[];
  expectedAnswer?: string;
  documentReferences?: string[];
  order: number;
  notes?: string;
}

export interface ExhibitReference {
  id: string;
  exhibitNumber: string;
  description: string;
  relevantTopics: string[];
  documentId?: string;
  notes?: string;
}

export enum OutlineStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  IN_USE = 'IN_USE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('deposition_outlines')
@Index(['matterId'])
@Index(['status'])
@Index(['depositionDate'])
export class DepositionOutline extends BaseEntity {
  @Column({ name: 'matter_id', type: 'uuid' })
  @Index()
  matterId!: string;

  @ManyToOne(() => Matter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matter_id' })
  matter!: Matter;

  @Column({ name: 'witness_name', type: 'varchar', length: 255 })
  witnessName!: string;

  @Column({ name: 'witness_role', type: 'varchar', length: 255, nullable: true })
  witnessRole?: string;

  @Column({ name: 'witness_affiliation', type: 'varchar', length: 255, nullable: true })
  witnessAffiliation?: string;

  @Column({ type: 'jsonb' })
  topics!: DepositionTopic[];

  @Column({ type: 'jsonb' })
  questions!: DepositionQuestion[];

  @Column({ type: 'jsonb' })
  exhibits!: ExhibitReference[];

  @Column({
    type: 'enum',
    enum: OutlineStatus,
    default: OutlineStatus.DRAFT,
  })
  status!: OutlineStatus;

  @Column({ type: 'text', nullable: true })
  objectives?: string;

  @Column({ name: 'key_facts', type: 'jsonb', nullable: true })
  keyFacts?: { fact: string; importance: string }[];

  @Column({ name: 'deposition_date', type: 'date', nullable: true })
  depositionDate?: Date;

  @Column({ name: 'estimated_duration_minutes', type: 'int', nullable: true })
  estimatedDurationMinutes?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ name: 'preparation_notes', type: 'text', nullable: true })
  preparationNotes?: string;

  @Column({ name: 'model_used', type: 'varchar', length: 100 })
  modelUsed!: string;

  @Column({ name: 'generation_date', type: 'timestamp with time zone' })
  generationDate!: Date;

  @Column({ name: 'last_modified_by', type: 'uuid', nullable: true })
  lastModifiedBy?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
