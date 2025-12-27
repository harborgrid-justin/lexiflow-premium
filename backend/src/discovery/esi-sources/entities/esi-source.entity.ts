import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Case } from '@cases/entities/case.entity';

export enum ESISourceType {
  EMAIL = 'email',
  FILE_SHARE = 'file_share',
  DATABASE = 'database',
  CLOUD_STORAGE = 'cloud_storage',
  MOBILE_DEVICE = 'mobile_device',
  SOCIAL_MEDIA = 'social_media',
  BACKUP_TAPE = 'backup_tape',
  COLLABORATION_TOOL = 'collaboration_tool',
  LEGACY_SYSTEM = 'legacy_system',
  OTHER = 'other',
}

export enum ESISourceStatus {
  IDENTIFIED = 'identified',
  PRESERVATION_HOLD = 'preservation_hold',
  COLLECTION_PENDING = 'collection_pending',
  COLLECTING = 'collecting',
  COLLECTED = 'collected',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  PRODUCED = 'produced',
  ARCHIVED = 'archived',
}

@Entity('esi_sources')
@Index(['caseId'])
@Index(['custodianId'])
@Index(['sourceType'])
@Index(['status'])
export class ESISource extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'custodian_id', type: 'uuid', nullable: true })
  custodianId!: string;

  @Column({ name: 'custodian_name', type: 'varchar', length: 255, nullable: true })
  custodianName!: string;

  @Column({ name: 'source_name', type: 'varchar', length: 300 })
  sourceName!: string;

  @Column({
    name: 'source_type',
    type: 'enum',
    enum: ESISourceType,
  })
  sourceType!: ESISourceType;

  @Column({ name: 'source_description', type: 'text', nullable: true })
  sourceDescription!: string;

  @Column({
    type: 'enum',
    enum: ESISourceStatus,
    default: ESISourceStatus.IDENTIFIED,
  })
  status!: ESISourceStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location!: string;

  @Column({ name: 'data_volume', type: 'varchar', length: 100, nullable: true })
  dataVolume!: string;

  @Column({ name: 'item_count', type: 'integer', nullable: true })
  itemCount!: number;

  @Column({ name: 'date_range_start', type: 'date', nullable: true })
  dateRangeStart!: Date;

  @Column({ name: 'date_range_end', type: 'date', nullable: true })
  dateRangeEnd!: Date;

  @Column({ name: 'collection_method', type: 'varchar', length: 255, nullable: true })
  collectionMethod!: string;

  @Column({ name: 'collection_date', type: 'timestamp', nullable: true })
  collectionDate!: Date;

  @Column({ name: 'collected_by', type: 'varchar', length: 255, nullable: true })
  collectedBy!: string;

  @Column({ name: 'processing_method', type: 'varchar', length: 255, nullable: true })
  processingMethod!: string;

  @Column({ name: 'processing_date', type: 'timestamp', nullable: true })
  processingDate!: Date;

  @Column({ name: 'processed_by', type: 'varchar', length: 255, nullable: true })
  processedBy!: string;

  @Column({ name: 'actual_volume', type: 'bigint', nullable: true })
  actualVolume!: number;

  @Column({ name: 'collection_cost', type: 'decimal', precision: 15, scale: 2, nullable: true })
  collectionCost!: number;

  @Column({ name: 'processing_cost', type: 'decimal', precision: 15, scale: 2, nullable: true })
  processingCost!: number;

  @Column({ name: 'is_encrypted', type: 'boolean', default: false })
  isEncrypted!: boolean;

  @Column({ name: 'requires_special_processing', type: 'boolean', default: false })
  requiresSpecialProcessing!: boolean;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;
}
