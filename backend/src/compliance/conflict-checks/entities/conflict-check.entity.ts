import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Case } from '../../../cases/entities/case.entity';

@Entity('conflict_checks')
@Index(['caseId'])
@Index(['status'])
@Index(['checkDate'])
@Index(['requestedBy'])
export class ConflictCheck extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  caseId!: string;

  @ManyToOne(() => Case, { nullable: true })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'potential_client_id', type: 'uuid', nullable: true })
  potentialClientId!: string;

  @Column({ name: 'potential_client_name', type: 'varchar', length: 255 })
  potentialClientName!: string;

  @Column({ name: 'requested_by', type: 'uuid' })
  requestedBy!: string;

  @Column({ name: 'check_date', type: 'date' })
  checkDate!: Date;

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
  status!: string;

  @Column({ name: 'matter_description', type: 'text' })
  matterDescription!: string;

  @Column({ name: 'parties_involved', type: 'jsonb', nullable: true })
  partiesInvolved!: string[];

  @Column({ name: 'related_entities', type: 'jsonb', nullable: true })
  relatedEntities!: string[];

  @Column({ name: 'opposing_parties', type: 'jsonb', nullable: true })
  opposingParties!: string[];

  @Column({ name: 'opposing_counsel', type: 'jsonb', nullable: true })
  opposingCounsel!: string[];

  @Column({ name: 'has_conflict', type: 'boolean', default: false })
  hasConflict!: boolean;

  @Column({ name: 'conflicting_cases', type: 'jsonb', nullable: true })
  conflictingCases!: string[];

  @Column({ name: 'conflicting_clients', type: 'jsonb', nullable: true })
  conflictingClients!: string[];

  @Column({ name: 'conflicting_entities', type: 'jsonb', nullable: true })
  conflictingEntities!: string[];

  @Column({ name: 'conflict_description', type: 'text', nullable: true })
  conflictDescription!: string;

  @Column({
    name: 'conflict_type',
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
  conflictType!: string;

  @Column({
    name: 'conflict_severity',
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
    nullable: true,
  })
  conflictSeverity!: string;

  @Column({ name: 'performed_by', type: 'uuid', nullable: true })
  performedBy!: string;

  @Column({ name: 'completed_date', type: 'date', nullable: true })
  completedDate!: Date;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy!: string;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes!: string;

  @Column({ name: 'waiver_required', type: 'boolean', default: false })
  waiverRequired!: boolean;

  @Column({ name: 'waiver_status', type: 'varchar', length: 50, nullable: true })
  waiverStatus!: string;

  @Column({ name: 'waiver_date', type: 'date', nullable: true })
  waiverDate!: Date;

  @Column({ name: 'waiver_document_id', type: 'uuid', nullable: true })
  waiverDocumentId!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;
}
