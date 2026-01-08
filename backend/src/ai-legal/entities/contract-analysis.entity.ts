import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Document } from '@documents/entities/document.entity';

export enum AnalysisStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ClauseExtraction {
  id: string;
  type: string;
  title: string;
  content: string;
  pageNumber?: number;
  position?: { start: number; end: number };
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RiskDetection {
  id: string;
  category: string;
  description: string;
  severity: RiskLevel;
  clause?: ClauseExtraction;
  recommendation: string;
  confidence: number;
}

export interface Recommendation {
  id: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  suggestedAction: string;
  relatedClauses: string[];
}

@Entity('contract_analyses')
@Index(['documentId'])
@Index(['status'])
@Index(['analysisDate'])
export class ContractAnalysis extends BaseEntity {
  @Column({ name: 'document_id', type: 'uuid' })
  @Index()
  documentId!: string;

  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document!: Document;

  @Column({ type: 'jsonb' })
  clauses!: ClauseExtraction[];

  @Column({ type: 'jsonb' })
  risks!: RiskDetection[];

  @Column({ type: 'jsonb' })
  recommendations!: Recommendation[];

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  confidence!: number;

  @Column({
    type: 'enum',
    enum: AnalysisStatus,
    default: AnalysisStatus.PENDING,
  })
  status!: AnalysisStatus;

  @Column({ name: 'analysis_date', type: 'timestamp with time zone' })
  analysisDate!: Date;

  @Column({ name: 'model_used', type: 'varchar', length: 100 })
  modelUsed!: string;

  @Column({ name: 'processing_time_ms', type: 'int', nullable: true })
  processingTimeMs?: number;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ name: 'key_terms', type: 'jsonb', nullable: true })
  keyTerms?: Record<string, string>;

  @Column({ name: 'contract_type', type: 'varchar', length: 255, nullable: true })
  contractType?: string;

  @Column({ name: 'parties_identified', type: 'jsonb', nullable: true })
  partiesIdentified?: { name: string; role: string }[];

  @Column({ name: 'effective_date', type: 'date', nullable: true })
  effectiveDate?: Date;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate?: Date;

  @Column({ name: 'total_value', type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalValue?: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
