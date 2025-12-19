import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Case } from '../../../cases/entities/case.entity';

export enum EthicalWallStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  LIFTED = 'lifted',
  EXPIRED = 'expired',
}

@Entity('ethical_walls')
@Index(['caseId'])
@Index(['status'])
export class EthicalWall extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid' })
  caseId: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Column({ name: 'wall_name', type: 'varchar', length: 500 })
  wallName: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'restricted_users', type: 'jsonb' })
  restrictedUsers: string[];

  @Column({ name: 'allowed_users', type: 'jsonb', nullable: true })
  allowedUsers: string[];

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: EthicalWallStatus,
    default: EthicalWallStatus.ACTIVE,
  })
  status: EthicalWallStatus;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: Date;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approval_date', type: 'date', nullable: true })
  approvalDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  restrictions: Record<string, any>;

  @Column({ name: 'access_limitations', type: 'jsonb', nullable: true })
  accessLimitations: Record<string, any>;

  @Column({ name: 'communication_restrictions', type: 'jsonb', nullable: true })
  communicationRestrictions: string[];

  @Column({ name: 'physical_separation_required', type: 'boolean', default: true })
  physicalSeparationRequired: boolean;

  @Column({ name: 'physical_separation_details', type: 'text', nullable: true })
  physicalSeparationDetails: string;

  @Column({ name: 'document_access_restricted', type: 'boolean', default: true })
  documentAccessRestricted: boolean;

  @Column({ name: 'restricted_documents', type: 'jsonb', nullable: true })
  restrictedDocuments: string[];

  @Column({ name: 'restricted_systems', type: 'jsonb', nullable: true })
  restrictedSystems: string[];

  @Column({ name: 'electronic_barriers_implemented', type: 'boolean', default: false })
  electronicBarriersImplemented: boolean;

  @Column({ name: 'electronic_barrier_details', type: 'text', nullable: true })
  electronicBarrierDetails: string;

  @Column({ name: 'conflict_check_id', type: 'uuid', nullable: true })
  conflictCheckId: string;

  @Column({ name: 'related_matter_id', type: 'uuid', nullable: true })
  relatedMatterId: string;

  @Column({ name: 'notice_to_clients', type: 'text', nullable: true })
  noticeToClients: string;

  @Column({ name: 'client_consent_obtained', type: 'boolean', default: false })
  clientConsentObtained: boolean;

  @Column({ name: 'consent_date', type: 'date', nullable: true })
  consentDate: Date;

  @Column({ name: 'consent_document_path', type: 'varchar', length: 500, nullable: true })
  consentDocumentPath: string;

  @Column({ name: 'monitoring_procedures', type: 'jsonb', nullable: true })
  monitoringProcedures: Record<string, any>;

  @Column({ name: 'compliance_officer_id', type: 'uuid', nullable: true })
  complianceOfficerId: string;
}
