import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('esi_sources')
@Index(['caseId'])
@Index(['custodianId'])
@Index(['sourceType'])
@Index(['status'])
export class ESISource extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'uuid', nullable: true })
  custodianId: string;

  @Column({ type: 'varchar', length: 255 })
  custodianName: string;

  @Column({
    type: 'enum',
    enum: [
      'email',
      'file_server',
      'database',
      'mobile_device',
      'cloud_storage',
      'social_media',
      'backup_tape',
      'legacy_system',
      'other',
    ],
  })
  sourceType: string;

  @Column({ type: 'varchar', length: 500 })
  sourceName: string;

  @Column({ type: 'text', nullable: true })
  sourceDescription: string;

  @Column({
    type: 'enum',
    enum: [
      'identified',
      'preservation_hold',
      'collection_pending',
      'collecting',
      'collected',
      'processing',
      'processed',
      'reviewed',
      'produced',
    ],
    default: 'identified',
  })
  status: string;

  @Column({ type: 'date', nullable: true })
  identificationDate: Date;

  @Column({ type: 'date', nullable: true })
  preservationDate: Date;

  @Column({ type: 'date', nullable: true })
  collectionDate: Date;

  @Column({ type: 'date', nullable: true })
  processingDate: Date;

  @Column({ type: 'bigint', nullable: true })
  estimatedDataVolume: number;

  @Column({ type: 'bigint', nullable: true })
  actualDataVolume: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dataVolumeUnit: string;

  @Column({ type: 'integer', nullable: true })
  numberOfFiles: number;

  @Column({ type: 'date', nullable: true })
  dateRangeStart: Date;

  @Column({ type: 'date', nullable: true })
  dateRangeEnd: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  collectionLocation: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  storageLocation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  collectionMethod: string;

  @Column({ type: 'uuid', nullable: true })
  collectedBy: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  forensicImage: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  imageHash: string;

  @Column({ type: 'boolean', default: false })
  isEncrypted: boolean;

  @Column({ type: 'boolean', default: false })
  hasPrivilegedContent: boolean;

  @Column({ type: 'boolean', default: false })
  requiresDecryption: boolean;

  @Column({ type: 'jsonb', nullable: true })
  searchTerms: string[];

  @Column({ type: 'jsonb', nullable: true })
  fileTypes: string[];

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  collectionCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  processingCost: number;

  @Column({ type: 'text', nullable: true })
  chainOfCustody: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
