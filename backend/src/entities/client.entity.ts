import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from '../cases/entities/case.entity';
import { Invoice } from '../billing/invoices/entities/invoice.entity';

@Entity('clients')
@Index(['clientNumber'], { unique: true })
@Index(['clientType'])
@Index(['status'])
@Index(['email'])
export class Client extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  clientNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: ['individual', 'corporation', 'partnership', 'llc', 'nonprofit', 'government', 'other'],
    nullable: true,
  })
  clientType: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'prospective', 'former', 'blocked'],
    default: 'active',
  })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fax: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website: string;

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

  @Column({ type: 'text', nullable: true })
  billingAddress: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  billingCity: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  billingState: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  billingZipCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  billingCountry: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  taxId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  industry: string;

  @Column({ type: 'date', nullable: true })
  establishedDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  primaryContactName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  primaryContactEmail: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  primaryContactPhone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  primaryContactTitle: string;

  @Column({ type: 'uuid', nullable: true })
  accountManagerId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referralSource: string;

  @Column({ type: 'date', nullable: true })
  clientSince: Date;

  @Column({
    type: 'enum',
    enum: ['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom'],
    default: 'net_30',
  })
  paymentTerms: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  preferredPaymentMethod: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditLimit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBilled: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPaid: number;

  @Column({ type: 'integer', default: 0 })
  totalCases: number;

  @Column({ type: 'integer', default: 0 })
  activeCases: number;

  @Column({ type: 'boolean', default: false })
  isVip: boolean;

  @Column({ type: 'boolean', default: false })
  requiresConflictCheck: boolean;

  @Column({ type: 'date', nullable: true })
  lastConflictCheckDate: Date;

  @Column({ type: 'boolean', default: false })
  hasRetainer: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  retainerAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  retainerBalance: number;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 500, nullable: true })
  portalToken: string;

  @Column({ type: 'timestamp', nullable: true })
  portalTokenExpiry: Date;

  // Relations
  @OneToMany(() => Case, (caseEntity) => caseEntity.client)
  cases: Case[];

  @OneToMany(() => Invoice, (invoice) => invoice.client)
  invoices: Invoice[];
}
