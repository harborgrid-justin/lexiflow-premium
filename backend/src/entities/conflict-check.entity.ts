import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from '../cases/entities/case.entity';

@Entity('conflict_checks')
@Index(['caseId'])
@Index(['status'])
@Index(['checkDate'])
@Index(['requestedBy'])
export class ConflictCheck extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  caseId: string;

  @Column({ type: 'uuid', nullable: true })
  potentialClientId: string;

  @Column({ type: 'varchar', length: 255 })
  potentialClientName: string;

  @Column({ type: 'uuid' })
  requestedBy: string;

  @Column({ type: 'date' })
  checkDate: Date;

  @Column({
    type: 'enum',
    enum: [
      'pending',
      'in_progress',
      'no_conflict',
      'conflict_identified',
      'waiver_obtained',
      'declined',
    ],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'text' })
  matterDescription: string;

  @Column({ type: 'jsonb', nullable: true })
  partiesInvolved: string[];

  @Column({ type: 'jsonb', nullable: true })
  relatedEntities: string[];

  @Column({ type: 'jsonb', nullable: true })
  opposingParties: string[];

  @Column({ type: 'jsonb', nullable: true })
  opposingCounsel: string[];

  @Column({ type: 'boolean', default: false })
  hasConflict: boolean;

  @Column({ type: 'jsonb', nullable: true })
  conflictingCases: string[];

  @Column({ type: 'jsonb', nullable: true })
  conflictingClients: string[];

  @Column({ type: 'jsonb', nullable: true })
  conflictingEntities: string[];

  @Column({ type: 'text', nullable: true })
  conflictDescription: string;

  @Column({
    type: 'enum',
    enum: [
      'direct_representation',
      'adverse_interest',
      'concurrent_representation',
      'former_client',
      'business_relationship',
      'personal_relationship',
      'financial_interest',
      'other',
    ],
    nullable: true,
  })
  conflictType: string;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
    nullable: true,
  })
  conflictSeverity: string;

  @Column({ type: 'uuid', nullable: true })
  performedBy: string;

  @Column({ type: 'date', nullable: true })
  completedDate: Date;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string;

  @Column({ type: 'date', nullable: true })
  reviewDate: Date;

  @Column({ type: 'text', nullable: true })
  reviewComments: string;

  @Column({ type: 'boolean', default: false })
  waiverRequired: boolean;

  @Column({ type: 'boolean', default: false })
  waiverObtained: boolean;

  @Column({ type: 'date', nullable: true })
  waiverDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  waiverDocumentPath: string;

  @Column({ type: 'jsonb', nullable: true })
  waiverSignatories: string[];

  @Column({ type: 'text', nullable: true })
  waiverDetails: string;

  @Column({ type: 'boolean', default: false })
  ethicalWallRequired: boolean;

  @Column({ type: 'uuid', nullable: true })
  ethicalWallId: string;

  @Column({ type: 'text', nullable: true })
  mitigationMeasures: string;

  @Column({ type: 'boolean', default: false })
  engagementDeclined: boolean;

  @Column({ type: 'date', nullable: true })
  declinedDate: Date;

  @Column({ type: 'text', nullable: true })
  declinedReason: string;

  @Column({ type: 'jsonb', nullable: true })
  searchCriteria: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  searchResults: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Case, (caseEntity) => caseEntity.conflictChecks)
  @JoinColumn({ name: 'caseId' })
  case: Case;
}
