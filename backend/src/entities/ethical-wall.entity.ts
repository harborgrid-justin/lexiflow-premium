import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ethical_walls')
@Index(['caseId'])
@Index(['status'])
@Index(['createdBy'])
export class EthicalWall extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'varchar', length: 500 })
  wallName: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb' })
  restrictedUsers: string[];

  @Column({ type: 'jsonb', nullable: true })
  allowedUsers: string[];

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'pending', 'lifted', 'expired'],
    default: 'active',
  })
  status: string;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'date', nullable: true })
  approvalDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  restrictions: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  accessLimitations: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  communicationRestrictions: string[];

  @Column({ type: 'boolean', default: true })
  physicalSeparationRequired: boolean;

  @Column({ type: 'text', nullable: true })
  physicalSeparationDetails: string;

  @Column({ type: 'boolean', default: true })
  documentAccessRestricted: boolean;

  @Column({ type: 'jsonb', nullable: true })
  restrictedDocuments: string[];

  @Column({ type: 'jsonb', nullable: true })
  restrictedSystems: string[];

  @Column({ type: 'boolean', default: false })
  electronicBarriersImplemented: boolean;

  @Column({ type: 'text', nullable: true })
  electronicBarrierDetails: string;

  @Column({ type: 'uuid', nullable: true })
  conflictCheckId: string;

  @Column({ type: 'uuid', nullable: true })
  relatedMatterId: string;

  @Column({ type: 'text', nullable: true })
  noticeToClients: string;

  @Column({ type: 'boolean', default: false })
  clientConsentObtained: boolean;

  @Column({ type: 'date', nullable: true })
  consentDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  consentDocumentPath: string;

  @Column({ type: 'jsonb', nullable: true })
  monitoringProcedures: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  monitoredBy: string;

  @Column({ type: 'integer', default: 30 })
  reviewFrequencyDays: number;

  @Column({ type: 'date', nullable: true })
  lastReviewDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  reviewHistory: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  breachIncidents: Record<string, any>[];

  @Column({ type: 'boolean', default: false })
  hasBreaches: boolean;

  @Column({ type: 'text', nullable: true })
  breachResolution: string;

  @Column({ type: 'date', nullable: true })
  liftedDate: Date;

  @Column({ type: 'uuid', nullable: true })
  liftedBy: string;

  @Column({ type: 'text', nullable: true })
  liftedReason: string;

  @Column({ type: 'text', nullable: true })
  trainingRequired: string;

  @Column({ type: 'jsonb', nullable: true })
  trainingCompleted: Record<string, any>[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
