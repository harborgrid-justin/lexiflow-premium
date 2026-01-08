import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Case } from '@cases/entities/case.entity';

export enum DiscoveryProjectStatus {
  PLANNING = 'planning',
  COLLECTION = 'collection',
  PROCESSING = 'processing',
  REVIEW = 'review',
  PRODUCTION = 'production',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

export enum DiscoveryProjectType {
  LITIGATION = 'litigation',
  INVESTIGATION = 'investigation',
  REGULATORY = 'regulatory',
  AUDIT = 'audit',
  INFORMATION_GOVERNANCE = 'information_governance',
}

@Entity('discovery_projects')
@Index(['caseId'])
@Index(['matterId'])
@Index(['status'])
@Index(['createdAt'])
export class DiscoveryProject extends BaseEntity {
  @Column({ name: 'matter_id', type: 'uuid', nullable: true })
  matterId!: string;

  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  caseId!: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'case_id' })
  case?: Case;

  @Column({ type: 'varchar', length: 300 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({
    name: 'project_type',
    type: 'enum',
    enum: DiscoveryProjectType,
    default: DiscoveryProjectType.LITIGATION,
  })
  projectType!: DiscoveryProjectType;

  @Column({
    type: 'enum',
    enum: DiscoveryProjectStatus,
    default: DiscoveryProjectStatus.PLANNING,
  })
  status!: DiscoveryProjectStatus;

  @Column({ name: 'custodian_count', type: 'int', default: 0 })
  custodianCount!: number;

  @Column({ name: 'data_sources', type: 'jsonb', nullable: true })
  dataSources!: Array<{
    sourceId: string;
    sourceName: string;
    sourceType: string;
    location: string;
    status: string;
  }>;

  @Column({ name: 'date_range_start', type: 'date', nullable: true })
  dateRangeStart!: Date;

  @Column({ name: 'date_range_end', type: 'date', nullable: true })
  dateRangeEnd!: Date;

  @Column({ name: 'key_terms', type: 'jsonb', nullable: true })
  keyTerms!: string[];

  @Column({ name: 'search_terms', type: 'jsonb', nullable: true })
  searchTerms!: Array<{
    term: string;
    category: string;
    mandatory: boolean;
  }>;

  @Column({ name: 'collection_start_date', type: 'date', nullable: true })
  collectionStartDate!: Date;

  @Column({ name: 'collection_end_date', type: 'date', nullable: true })
  collectionEndDate!: Date;

  @Column({ name: 'processing_start_date', type: 'date', nullable: true })
  processingStartDate!: Date;

  @Column({ name: 'processing_end_date', type: 'date', nullable: true })
  processingEndDate!: Date;

  @Column({ name: 'review_start_date', type: 'date', nullable: true })
  reviewStartDate!: Date;

  @Column({ name: 'review_end_date', type: 'date', nullable: true })
  reviewEndDate!: Date;

  @Column({ name: 'production_deadline', type: 'date', nullable: true })
  productionDeadline!: Date;

  @Column({ name: 'total_items_collected', type: 'bigint', default: 0 })
  totalItemsCollected!: number;

  @Column({ name: 'total_items_processed', type: 'bigint', default: 0 })
  totalItemsProcessed!: number;

  @Column({ name: 'total_items_reviewed', type: 'bigint', default: 0 })
  totalItemsReviewed!: number;

  @Column({ name: 'total_items_produced', type: 'bigint', default: 0 })
  totalItemsProduced!: number;

  @Column({ name: 'total_size_bytes', type: 'bigint', default: 0 })
  totalSizeBytes!: number;

  @Column({ name: 'deduplication_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  deduplicationRate!: number;

  @Column({ name: 'responsiveness_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  responsivenessRate!: number;

  @Column({ name: 'privilege_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  privilegeRate!: number;

  @Column({ name: 'estimated_budget', type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedBudget!: number;

  @Column({ name: 'actual_cost', type: 'decimal', precision: 12, scale: 2, default: 0 })
  actualCost!: number;

  @Column({ name: 'review_team', type: 'jsonb', nullable: true })
  reviewTeam!: Array<{
    userId: string;
    userName: string;
    role: string;
    assignedDate: Date;
  }>;

  @Column({ name: 'protocol_settings', type: 'jsonb', nullable: true })
  protocolSettings!: {
    reviewProtocol?: string;
    qcPercentage?: number;
    privilegeReview?: boolean;
    tarEnabled?: boolean;
    batesPrefix?: string;
    productionFormat?: string;
  };

  @Column({ name: 'tar_enabled', type: 'boolean', default: false })
  tarEnabled!: boolean;

  @Column({ name: 'tar_model_id', type: 'uuid', nullable: true })
  tarModelId!: string;

  @Column({ name: 'project_manager_id', type: 'uuid', nullable: true })
  projectManagerId!: string;

  @Column({ name: 'lead_reviewer_id', type: 'uuid', nullable: true })
  leadReviewerId!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;
}
