import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ESISourceType {
  EMAIL = 'EMAIL',
  FILE_SHARE = 'FILE_SHARE',
  DATABASE = 'DATABASE',
  CLOUD_STORAGE = 'CLOUD_STORAGE',
  MOBILE_DEVICE = 'MOBILE_DEVICE',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  BACKUP_TAPE = 'BACKUP_TAPE',
  COLLABORATION_TOOL = 'COLLABORATION_TOOL',
  OTHER = 'OTHER',
}

export enum ESISourceStatus {
  IDENTIFIED = 'IDENTIFIED',
  PRESERVED = 'PRESERVED',
  COLLECTED = 'COLLECTED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  PRODUCED = 'PRODUCED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('esi_sources')
export class ESISource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'varchar', length: 300 })
  sourceName: string;

  @Column({
    type: 'enum',
    enum: ESISourceType,
  })
  sourceType: ESISourceType;

  @Column({
    type: 'enum',
    enum: ESISourceStatus,
    default: ESISourceStatus.IDENTIFIED,
  })
  status: ESISourceStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  custodian: string;

  @Column({ type: 'uuid', nullable: true })
  custodianId: string;

  @Column({ type: 'date', nullable: true })
  dateIdentified: Date;

  @Column({ type: 'date', nullable: true })
  datePreserved: Date;

  @Column({ type: 'date', nullable: true })
  dateCollected: Date;

  @Column({ type: 'date', nullable: true })
  dateProcessed: Date;

  @Column({ type: 'bigint', nullable: true })
  estimatedVolume: number;

  @Column({ type: 'bigint', nullable: true })
  actualVolume: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  volumeUnit: string; // GB, MB, Items, etc.

  @Column({ type: 'date', nullable: true })
  dateRangeStart: Date;

  @Column({ type: 'date', nullable: true })
  dateRangeEnd: Date;

  @Column({ type: 'jsonb', nullable: true })
  fileTypes: string[];

  @Column({ type: 'text', nullable: true })
  searchTerms: string;

  @Column({ type: 'boolean', default: false })
  isEncrypted: boolean;

  @Column({ type: 'boolean', default: false })
  requiresSpecialProcessing: boolean;

  @Column({ type: 'text', nullable: true })
  processingNotes: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  collectionMethod: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  collectionVendor: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  collectionCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  processingCost: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  assignedTo: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
