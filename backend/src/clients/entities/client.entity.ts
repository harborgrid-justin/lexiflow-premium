import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Case } from '../../cases/entities/case.entity';
import { Invoice } from '../../billing/invoices/entities/invoice.entity';

@Entity('clients')
@Index(['clientNumber'], { unique: true })
@Index(['clientType'])
@Index(['status'])
@Index(['email'])
export class Client extends BaseEntity {
  @Column({ name: 'client_number', type: 'varchar', length: 100, unique: true, nullable: true })
  clientNumber!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string;

  @Column({
    name: 'client_type',
    type: 'enum',
    enum: ['individual', 'corporation', 'partnership', 'llc', 'nonprofit', 'government', 'other'],
    nullable: true,
  })
  clientType!: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'prospective', 'former', 'blocked'],
    default: 'active',
  })
  status!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fax!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website!: string;

  @Column({ type: 'text', nullable: true })
  address!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state!: string;

  @Column({ name: 'zip_code', type: 'varchar', length: 20, nullable: true })
  zipCode!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country!: string;

  @Column({ name: 'billing_address', type: 'text', nullable: true })
  billingAddress!: string;

  @Column({ name: 'billing_city', type: 'varchar', length: 100, nullable: true })
  billingCity!: string;

  @Column({ name: 'billing_state', type: 'varchar', length: 100, nullable: true })
  billingState!: string;

  @Column({ name: 'billing_zip_code', type: 'varchar', length: 20, nullable: true })
  billingZipCode!: string;

  @Column({ name: 'billing_country', type: 'varchar', length: 100, nullable: true })
  billingCountry!: string;

  @Column({ name: 'tax_id', type: 'varchar', length: 100, nullable: true })
  taxId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  industry!: string;

  @Column({ name: 'established_date', type: 'date', nullable: true })
  establishedDate!: Date;

  @Column({ name: 'primary_contact_name', type: 'varchar', length: 255, nullable: true })
  primaryContactName!: string;

  @Column({ name: 'primary_contact_email', type: 'varchar', length: 255, nullable: true })
  primaryContactEmail!: string;

  @Column({ name: 'primary_contact_phone', type: 'varchar', length: 50, nullable: true })
  primaryContactPhone!: string;

  @Column({ name: 'primary_contact_title', type: 'varchar', length: 100, nullable: true })
  primaryContactTitle!: string;

  @Column({ name: 'account_manager_id', type: 'uuid', nullable: true })
  accountManagerId!: string;

  @Column({ name: 'referral_source', type: 'varchar', length: 255, nullable: true })
  referralSource!: string;

  @Column({ name: 'client_since', type: 'date', nullable: true })
  clientSince!: Date;

  @Column({
    name: 'payment_terms',
    type: 'enum',
    enum: ['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom'],
    default: 'net_30',
  })
  paymentTerms!: string;

  @Column({ name: 'preferred_payment_method', type: 'varchar', length: 100, nullable: true })
  preferredPaymentMethod!: string;

  @Column({ name: 'credit_limit', type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditLimit!: number;

  @Column({ name: 'current_balance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentBalance!: number;

  @Column({ name: 'total_billed', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBilled!: number;

  @Column({ name: 'total_paid', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPaid!: number;

  @Column({ name: 'total_cases', type: 'integer', default: 0 })
  totalCases!: number;

  @Column({ name: 'active_cases', type: 'integer', default: 0 })
  activeCases!: number;

  @Column({ name: 'is_vip', type: 'boolean', default: false })
  isVip!: boolean;

  @Column({ name: 'requires_conflict_check', type: 'boolean', default: false })
  requiresConflictCheck!: boolean;

  @Column({ name: 'last_conflict_check_date', type: 'date', nullable: true })
  lastConflictCheckDate!: Date;

  @Column({ name: 'has_retainer', type: 'boolean', default: false })
  hasRetainer!: boolean;

  @Column({ name: 'retainer_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  retainerAmount!: number;

  @Column({ name: 'retainer_balance', type: 'decimal', precision: 15, scale: 2, nullable: true })
  retainerBalance!: number;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields!: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  tags!: string[];

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any>;

  @Column({ name: 'portal_token', type: 'varchar', length: 500, nullable: true })
  portalToken!: string;

  @Column({ name: 'portal_token_expiry', type: 'timestamp', nullable: true })
  portalTokenExpiry!: Date;

  // Relations
  @OneToMany(() => Case, (caseEntity) => caseEntity.client)
  cases!: Case[];

  @OneToMany(() => Invoice, (invoice) => invoice.client)
  invoices!: Invoice[];
}
