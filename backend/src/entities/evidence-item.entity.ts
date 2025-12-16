import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from '../cases/entities/case.entity';
import { ChainOfCustodyEvent } from './chain-of-custody-event.entity';

@Entity('evidence_items')
@Index(['evidenceNumber'])
@Index(['evidenceType'])
@Index(['status'])
export class EvidenceItem extends BaseEntity {
  @ManyToOne(() => Case, (caseEntity) => caseEntity.evidenceItems)
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  evidenceNumber: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title: string;

  @Column({
    type: 'enum',
    enum: [
      'physical',
      'digital',
      'document',
      'photograph',
      'video',
      'audio',
      'biological',
      'trace',
      'other',
    ],
    nullable: true,
  })
  evidenceType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: [
      'collected',
      'stored',
      'analyzed',
      'presented',
      'returned',
      'destroyed',
      'missing',
    ],
    default: 'collected',
  })
  status: string;

  @Column({ type: 'date', nullable: true })
  collectionDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  collectionLocation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  collectedBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  currentCustodian: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  storageLocation: string;

  @Column({ type: 'text', nullable: true })
  chainOfCustody: string;

  @Column({ type: 'boolean', default: true })
  chainOfCustodyIntact: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fileHash: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batesNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  exhibitNumber: string;

  @Column({ type: 'boolean', default: false })
  isAdmitted: boolean;

  @Column({ type: 'date', nullable: true })
  admittedDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  admittedBy: string;

  @Column({ type: 'boolean', default: false })
  isSealed: boolean;

  @Column({ type: 'boolean', default: false })
  isConfidential: boolean;

  @Column({ type: 'text', nullable: true })
  physicalDescription: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  condition: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  forensicAnalysis: string;

  @Column({ type: 'uuid', nullable: true })
  analyzedBy: string;

  @Column({ type: 'date', nullable: true })
  analysisDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimatedValue: number;

  @Column({ type: 'text', nullable: true })
  legalRelevance: string;

  @Column({ type: 'jsonb', nullable: true })
  relatedEvidence: string[];

  @Column({ type: 'text', nullable: true })
  disposalInstructions: string;

  @Column({ type: 'date', nullable: true })
  disposalDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => ChainOfCustodyEvent, (event) => event.evidenceItem, {
    cascade: true,
  })
  custodyEvents: ChainOfCustodyEvent[];
}
