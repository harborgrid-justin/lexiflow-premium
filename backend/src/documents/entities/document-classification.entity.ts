import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Document } from './document.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Legal Document Category Types
 */
export enum LegalDocumentCategory {
  // Pleadings & Motions
  COMPLAINT = 'complaint',
  ANSWER = 'answer',
  MOTION = 'motion',
  BRIEF = 'brief',
  MEMORANDUM = 'memorandum',

  // Discovery
  INTERROGATORIES = 'interrogatories',
  REQUESTS_FOR_PRODUCTION = 'requests_for_production',
  REQUESTS_FOR_ADMISSION = 'requests_for_admission',
  DEPOSITION = 'deposition',

  // Contracts
  CONTRACT = 'contract',
  AGREEMENT = 'agreement',
  AMENDMENT = 'amendment',
  ADDENDUM = 'addendum',

  // Court Documents
  COURT_ORDER = 'court_order',
  JUDGMENT = 'judgment',
  SUBPOENA = 'subpoena',
  SUMMONS = 'summons',
  NOTICE = 'notice',

  // Evidence
  EXHIBIT = 'exhibit',
  AFFIDAVIT = 'affidavit',
  DECLARATION = 'declaration',
  CERTIFICATE = 'certificate',

  // Correspondence
  LETTER = 'letter',
  EMAIL = 'email',
  MEMO = 'memo',

  // Other
  REPORT = 'report',
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  OTHER = 'other',
}

/**
 * DocumentClassification Entity
 * AI-powered document classification and categorization
 *
 * Features:
 * - Auto-classification using AI/ML models
 * - Confidence scoring
 * - Multi-tag support
 * - Legal document category taxonomy
 * - Jurisdiction detection
 */
@Entity('document_classifications')
@Index(['documentId'])
@Index(['category'])
@Index(['confidence'])
@Unique(['documentId', 'category'])
export class DocumentClassification extends BaseEntity {
  @ApiProperty({ description: 'Reference to classified document' })
  @Column({ name: 'document_id', type: 'uuid' })
  @Index()
  documentId!: string;

  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document!: Document;

  @ApiProperty({
    description: 'Primary document category',
    enum: LegalDocumentCategory
  })
  @Column({
    type: 'enum',
    enum: LegalDocumentCategory,
  })
  category!: LegalDocumentCategory;

  @ApiProperty({
    example: 0.95,
    description: 'Classification confidence (0-1)'
  })
  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  confidence!: number;

  @ApiProperty({ description: 'Alternative categories with scores' })
  @Column({ name: 'alternative_categories', type: 'jsonb', nullable: true })
  alternativeCategories?: Array<{
    category: string;
    confidence: number;
  }>;

  @ApiProperty({ description: 'Document tags (extracted keywords)' })
  @Column({ type: 'simple-array', nullable: true })
  tags!: string[];

  @ApiProperty({ description: 'Extracted legal concepts' })
  @Column({ name: 'legal_concepts', type: 'simple-array', nullable: true })
  legalConcepts?: string[];

  @ApiProperty({ description: 'Detected jurisdiction(s)' })
  @Column({ type: 'simple-array', nullable: true })
  jurisdictions?: string[];

  @ApiProperty({ description: 'Detected court level (federal, state, district)' })
  @Column({ name: 'court_level', nullable: true })
  courtLevel?: string;

  @ApiProperty({ description: 'Practice areas identified' })
  @Column({ name: 'practice_areas', type: 'simple-array', nullable: true })
  practiceAreas?: string[];

  @ApiProperty({ description: 'Extracted parties (plaintiff, defendant)' })
  @Column({ type: 'jsonb', nullable: true })
  parties?: {
    plaintiffs?: string[];
    defendants?: string[];
    thirdParties?: string[];
  };

  @ApiProperty({ description: 'Important dates extracted' })
  @Column({ name: 'important_dates', type: 'jsonb', nullable: true })
  importantDates?: {
    filingDate?: string;
    dueDate?: string;
    hearingDate?: string;
    effectiveDate?: string;
  };

  @ApiProperty({ description: 'Classification model used' })
  @Column({ name: 'model_name', default: 'auto' })
  modelName!: string;

  @ApiProperty({ description: 'Model version' })
  @Column({ name: 'model_version', nullable: true })
  modelVersion?: string;

  @ApiProperty({ description: 'Manual override flag' })
  @Column({ name: 'is_manual_override', type: 'boolean', default: false })
  isManualOverride!: boolean;

  @ApiProperty({ description: 'Manual classification notes' })
  @Column({ name: 'manual_notes', type: 'text', nullable: true })
  manualNotes?: string;

  @ApiProperty({ description: 'Classification timestamp' })
  @Column({ name: 'classified_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  classifiedAt!: Date;

  @ApiProperty({ description: 'Language of document' })
  @Column({ default: 'en' })
  language!: string;

  @ApiProperty({ description: 'Sentiment analysis result' })
  @Column({ type: 'jsonb', nullable: true })
  sentiment?: {
    score: number; // -1 to 1
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };

  @ApiProperty({ description: 'Additional extracted metadata' })
  @Column({ type: 'jsonb', nullable: true })
  extractedMetadata?: Record<string, unknown>;
}
