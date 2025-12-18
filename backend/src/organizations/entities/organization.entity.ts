import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';

export enum OrganizationType {
  CORPORATION = 'corporation',
  LLC = 'llc',
  PARTNERSHIP = 'partnership',
  SOLE_PROPRIETORSHIP = 'sole_proprietorship',
  NONPROFIT = 'nonprofit',
  GOVERNMENT_AGENCY = 'government_agency',
  TRUST = 'trust',
  ESTATE = 'estate',
  OTHER = 'other',
}

export enum OrganizationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISSOLVED = 'dissolved',
  MERGED = 'merged',
  ACQUIRED = 'acquired',
  BANKRUPT = 'bankrupt',
}

@Entity('organizations')
@Index(['organizationType'])
@Index(['name'])
@Index(['jurisdiction'])
export class Organization extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'legal_name', type: 'varchar', length: 255, nullable: true })
  legalName: string;

  @Column({
    name: 'organization_type',
    type: 'enum',
    enum: OrganizationType,
  })
  organizationType: OrganizationType;

  @Column({ name: 'tax_id', type: 'varchar', length: 100, nullable: true })
  taxId: string;

  @Column({ name: 'registration_number', type: 'varchar', length: 100, nullable: true })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  jurisdiction: string;

  @Column({ name: 'incorporation_date', type: 'date', nullable: true })
  incorporationDate: Date;

  @Column({ name: 'dissolution_date', type: 'date', nullable: true })
  dissolutionDate: Date;

  @Column({
    type: 'enum',
    enum: OrganizationStatus,
    default: OrganizationStatus.ACTIVE,
  })
  status: OrganizationStatus;

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

  @Column({ type: 'varchar', length: 500, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  industry: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ceo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cfo: string;

  @Column({ name: 'general_counsel', type: 'varchar', length: 255, nullable: true })
  generalCounsel: string;

  @Column({ type: 'jsonb', nullable: true })
  officers: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  directors: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  shareholders: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  members: Record<string, any>[];

  @Column({ name: 'registered_agent', type: 'varchar', length: 255, nullable: true })
  registeredAgent: string;

  @Column({ name: 'registered_agent_address', type: 'text', nullable: true })
  registeredAgentAddress: string;

  @Column({ name: 'parent_company', type: 'varchar', length: 255, nullable: true })
  parentCompany: string;

  @Column({ name: 'parent_organization_id', type: 'uuid', nullable: true })
  parentOrganizationId: string;

  @Column({ type: 'jsonb', nullable: true })
  subsidiaries: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  affiliates: Record<string, any>[];

  @Column({ name: 'number_of_employees', type: 'integer', nullable: true })
  numberOfEmployees: number;

  @Column({ name: 'annual_revenue', type: 'decimal', precision: 20, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ name: 'is_publicly_traded', type: 'boolean', default: false })
  isPubliclyTraded: boolean;

  @Column({ name: 'stock_symbol', type: 'varchar', length: 50, nullable: true })
  stockSymbol: string;

  @Column({ name: 'stock_exchange', type: 'varchar', length: 100, nullable: true })
  stockExchange: string;

  @Column({ type: 'jsonb', nullable: true })
  licenses: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  permits: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  certifications: Record<string, any>[];

  @Column({ name: 'bank_accounts', type: 'jsonb', nullable: true })
  bankAccounts: Record<string, any>[];

  @Column({ name: 'banking_info', type: 'text', nullable: true })
  bankingInfo: string;

  @Column({ name: 'insurance_policies', type: 'jsonb', nullable: true })
  insurancePolicies: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  properties: Record<string, any>[];

  @Column({ name: 'intellectual_property', type: 'jsonb', nullable: true })
  intellectualProperty: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  contracts: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  litigation: Record<string, any>[];

  @Column({ name: 'has_active_litigation', type: 'boolean', default: false })
  hasActiveLitigation: boolean;

  @Column({ name: 'litigation_summary', type: 'text', nullable: true })
  litigationSummary: string;

  @Column({ name: 'regulatory_filings', type: 'jsonb', nullable: true })
  regulatoryFilings: Record<string, any>[];

  @Column({ name: 'compliance_requirements', type: 'jsonb', nullable: true })
  complianceRequirements: Record<string, any>[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
