import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';

export enum LegalEntityType {
  INDIVIDUAL = 'individual',
  CORPORATION = 'corporation',
  LLC = 'llc',
  PARTNERSHIP = 'partnership',
  TRUST = 'trust',
  ESTATE = 'estate',
  NONPROFIT = 'nonprofit',
  GOVERNMENT = 'government',
  FOREIGN_ENTITY = 'foreign_entity',
  OTHER = 'other',
}

export enum LegalEntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISSOLVED = 'dissolved',
  SUSPENDED = 'suspended',
  OTHER = 'other',
}

@Entity('legal_entities')
@Index(['entityType'])
@Index(['name'])
@Index(['jurisdiction'])
export class LegalEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: LegalEntityType,
  })
  entityType: LegalEntityType;

  @Column({ name: 'full_legal_name', type: 'varchar', length: 255, nullable: true })
  fullLegalName: string;

  @Column({ name: 'tax_id', type: 'varchar', length: 100, nullable: true })
  taxId: string;

  @Column({ name: 'registration_number', type: 'varchar', length: 100, nullable: true })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  jurisdiction: string;

  @Column({ name: 'formation_date', type: 'date', nullable: true })
  formationDate: Date;

  @Column({
    type: 'enum',
    enum: LegalEntityStatus,
    default: LegalEntityStatus.ACTIVE,
  })
  status: LegalEntityStatus;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ name: 'zip_code', type: 'varchar', length: 20, nullable: true })
  zipCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'jsonb', nullable: true })
  relationships: Record<string, any>[];

  @Column({ name: 'parent_entity_id', type: 'uuid', nullable: true })
  parentEntityId: string;

  @Column({ name: 'parent_entity_name', type: 'varchar', length: 255, nullable: true })
  parentEntityName: string;

  @Column({ type: 'jsonb', nullable: true })
  subsidiaries: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  affiliates: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  representatives: Record<string, any>[];

  @Column({ name: 'primary_representative', type: 'varchar', length: 255, nullable: true })
  primaryRepresentative: string;

  @Column({ name: 'legal_counsel', type: 'varchar', length: 255, nullable: true })
  legalCounsel: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  accountant: string;

  @Column({ name: 'registered_agent', type: 'varchar', length: 255, nullable: true })
  registeredAgent: string;

  @Column({ name: 'registered_agent_address', type: 'text', nullable: true })
  registeredAgentAddress: string;

  @Column({ type: 'jsonb', nullable: true })
  officers: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  directors: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  members: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  beneficiaries: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  trustees: Record<string, any>[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  industry: string;

  @Column({ name: 'business_description', type: 'text', nullable: true })
  businessDescription: string;

  @Column({ name: 'number_of_employees', type: 'integer', nullable: true })
  numberOfEmployees: number;

  @Column({ name: 'annual_revenue', type: 'decimal', precision: 20, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ name: 'total_assets', type: 'decimal', precision: 20, scale: 2, nullable: true })
  totalAssets: number;

  @Column({ name: 'total_liabilities', type: 'decimal', precision: 20, scale: 2, nullable: true })
  totalLiabilities: number;

  @Column({ name: 'ownership_structure', type: 'jsonb', nullable: true })
  ownershipStructure: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  licenses: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  permits: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  filings: Record<string, any>[];

  @Column({ name: 'governing_documents', type: 'jsonb', nullable: true })
  governingDocuments: Record<string, any>[];

  @Column({ name: 'has_active_litigation', type: 'boolean', default: false })
  hasActiveLitigation: boolean;

  @Column({ name: 'litigation_history', type: 'jsonb', nullable: true })
  litigationHistory: Record<string, any>[];

  @Column({ name: 'has_regulatory_issues', type: 'boolean', default: false })
  hasRegulatoryIssues: boolean;

  @Column({ name: 'regulatory_issues', type: 'jsonb', nullable: true })
  regulatoryIssues: Record<string, any>[];

  @Column({ name: 'is_subject_to_conflict_check', type: 'boolean', default: false })
  isSubjectToConflictCheck: boolean;

  @Column({ name: 'last_conflict_check_date', type: 'date', nullable: true })
  lastConflictCheckDate: Date;

  @Column({ name: 'related_cases', type: 'jsonb', nullable: true })
  relatedCases: string[];

  @Column({ name: 'related_matters', type: 'jsonb', nullable: true })
  relatedMatters: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
