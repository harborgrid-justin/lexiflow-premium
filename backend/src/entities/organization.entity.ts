import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('organizations')
@Index(['organizationType'])
@Index(['name'])
@Index(['jurisdiction'])
export class Organization extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  legalName: string;

  @Column({
    type: 'enum',
    enum: [
      'corporation',
      'llc',
      'partnership',
      'sole_proprietorship',
      'nonprofit',
      'government_agency',
      'trust',
      'estate',
      'other',
    ],
  })
  organizationType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  taxId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  jurisdiction: string;

  @Column({ type: 'date', nullable: true })
  incorporationDate: Date;

  @Column({ type: 'date', nullable: true })
  dissolutionDate: Date;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'dissolved', 'merged', 'acquired', 'bankrupt'],
    default: 'active',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
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

  @Column({ type: 'varchar', length: 255, nullable: true })
  generalCounsel: string;

  @Column({ type: 'jsonb', nullable: true })
  officers: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  directors: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  shareholders: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  members: Record<string, any>[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  registeredAgent: string;

  @Column({ type: 'text', nullable: true })
  registeredAgentAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  parentCompany: string;

  @Column({ type: 'uuid', nullable: true })
  parentOrganizationId: string;

  @Column({ type: 'jsonb', nullable: true })
  subsidiaries: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  affiliates: Record<string, any>[];

  @Column({ type: 'integer', nullable: true })
  numberOfEmployees: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ type: 'boolean', default: false })
  isPubliclyTraded: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  stockSymbol: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  stockExchange: string;

  @Column({ type: 'jsonb', nullable: true })
  licenses: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  permits: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  certifications: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  bankAccounts: Record<string, any>[];

  @Column({ type: 'text', nullable: true })
  bankingInfo: string;

  @Column({ type: 'jsonb', nullable: true })
  insurancePolicies: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  properties: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  intellectualProperty: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  contracts: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  litigation: Record<string, any>[];

  @Column({ type: 'boolean', default: false })
  hasActiveLitigation: boolean;

  @Column({ type: 'text', nullable: true })
  litigationSummary: string;

  @Column({ type: 'jsonb', nullable: true })
  regulatoryFilings: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  complianceRequirements: Record<string, any>[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
