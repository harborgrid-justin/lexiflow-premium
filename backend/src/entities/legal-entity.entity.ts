import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('legal_entities')
@Index(['entityType'])
@Index(['name'])
@Index(['jurisdiction'])
export class LegalEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: [
      'individual',
      'corporation',
      'llc',
      'partnership',
      'trust',
      'estate',
      'nonprofit',
      'government',
      'foreign_entity',
      'other',
    ],
  })
  entityType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fullLegalName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  taxId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  jurisdiction: string;

  @Column({ type: 'date', nullable: true })
  formationDate: Date;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'dissolved', 'suspended', 'other'],
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

  @Column({ type: 'jsonb', nullable: true })
  relationships: Record<string, any>[];

  @Column({ type: 'uuid', nullable: true })
  parentEntityId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  parentEntityName: string;

  @Column({ type: 'jsonb', nullable: true })
  subsidiaries: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  affiliates: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  representatives: Record<string, any>[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  primaryRepresentative: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  legalCounsel: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  accountant: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  registeredAgent: string;

  @Column({ type: 'text', nullable: true })
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

  @Column({ type: 'text', nullable: true })
  businessDescription: string;

  @Column({ type: 'integer', nullable: true })
  numberOfEmployees: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  totalAssets: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  totalLiabilities: number;

  @Column({ type: 'jsonb', nullable: true })
  ownershipStructure: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  licenses: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  permits: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  filings: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  governingDocuments: Record<string, any>[];

  @Column({ type: 'boolean', default: false })
  hasActiveLitigation: boolean;

  @Column({ type: 'jsonb', nullable: true })
  litigationHistory: Record<string, any>[];

  @Column({ type: 'boolean', default: false })
  hasRegulatoryIssues: boolean;

  @Column({ type: 'jsonb', nullable: true })
  regulatoryIssues: Record<string, any>[];

  @Column({ type: 'boolean', default: false })
  isSubjectToConflictCheck: boolean;

  @Column({ type: 'date', nullable: true })
  lastConflictCheckDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  relatedCases: string[];

  @Column({ type: 'jsonb', nullable: true })
  relatedMatters: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
