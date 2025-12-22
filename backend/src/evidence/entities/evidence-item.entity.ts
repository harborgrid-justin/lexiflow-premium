import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Case } from '../../cases/entities/case.entity';
import { ChainOfCustodyEvent } from './chain-of-custody-event.entity';

export enum EvidenceType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
  DOCUMENT = 'document',
  PHOTOGRAPH = 'photograph',
  VIDEO = 'video',
  AUDIO = 'audio',
  BIOLOGICAL = 'biological',
  TRACE = 'trace',
  OTHER = 'other',
}

export enum EvidenceStatus {
  COLLECTED = 'collected',
  STORED = 'stored',
  ANALYZED = 'analyzed',
  PRESENTED = 'presented',
  RETURNED = 'returned',
  DESTROYED = 'destroyed',
  MISSING = 'missing',
}

@Entity('evidence_items')
@Index(['caseId'])
@Index(['evidenceNumber'])
@Index(['evidenceType'])
@Index(['status'])
export class EvidenceItem extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  caseId!: string;

  @ManyToOne(() => Case)
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'evidence_number', type: 'varchar', length: 100, unique: true, nullable: true })
  evidenceNumber!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title!: string;

  @Column({
    name: 'evidence_type',
    type: 'enum',
    enum: EvidenceType,
    nullable: true,
  })
  evidenceType!: EvidenceType;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({
    type: 'enum',
    enum: EvidenceStatus,
    default: EvidenceStatus.COLLECTED,
  })
  status!: EvidenceStatus;

  @Column({ name: 'collection_date', type: 'date', nullable: true })
  collectionDate!: Date;

  @Column({ name: 'collection_location', type: 'varchar', length: 500, nullable: true })
  collectionLocation!: string;

  @Column({ name: 'collected_by', type: 'varchar', length: 255, nullable: true })
  collectedBy!: string;

  @Column({ name: 'current_custodian', type: 'varchar', length: 255, nullable: true })
  currentCustodian!: string;

  @Column({ name: 'storage_location', type: 'varchar', length: 500, nullable: true })
  storageLocation!: string;

  @Column({ name: 'chain_of_custody', type: 'text', nullable: true })
  chainOfCustody!: string;

  @Column({ name: 'chain_of_custody_intact', type: 'boolean', default: true })
  chainOfCustodyIntact!: boolean;

  @Column({ name: 'file_path', type: 'varchar', length: 500, nullable: true })
  filePath!: string;

  @Column({ name: 'file_hash', type: 'varchar', length: 100, nullable: true })
  fileHash!: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize!: number;

  @Column({ name: 'bates_number', type: 'varchar', length: 100, nullable: true })
  batesNumber!: string;

  @Column({ name: 'exhibit_number', type: 'varchar', length: 100, nullable: true })
  exhibitNumber!: string;

  @Column({ name: 'is_admitted', type: 'boolean', default: false })
  isAdmitted!: boolean;

  @Column({ name: 'admitted_date', type: 'date', nullable: true })
  admittedDate!: Date;

  @Column({ name: 'admitted_by', type: 'varchar', length: 255, nullable: true })
  admittedBy!: string;

  @OneToMany(() => ChainOfCustodyEvent, event => event.evidenceItem)
  chainOfCustodyEvents!: ChainOfCustodyEvent[];
}
