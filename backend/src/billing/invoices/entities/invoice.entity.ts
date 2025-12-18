import {
  Entity,
  Column,
  OneToMany,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Client } from '../../../clients/entities/client.entity';
import { Case } from '../../../cases/entities/case.entity';

export enum InvoiceStatus {
  DRAFT = 'Draft',
  DRAFT_LOWER = 'draft',
  SENT = 'Sent',
  SENT_LOWER = 'sent',
  VIEWED = 'Viewed',
  VIEWED_LOWER = 'viewed',
  PARTIAL = 'Partial',
  PARTIAL_LOWER = 'partial',
  PAID = 'Paid',
  PAID_LOWER = 'paid',
  OVERDUE = 'Overdue',
  OVERDUE_LOWER = 'overdue',
  WRITTEN_OFF = 'Written Off',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum BillingModel {
  HOURLY = 'Hourly',
  FIXED_FEE = 'Fixed Fee',
  CONTINGENCY = 'Contingency',
  HYBRID = 'Hybrid',
  RETAINER = 'Retainer',
}

@Entity('invoices')
@Index(['caseId', 'status'])
@Index(['clientId', 'status'])
@Index(['status', 'dueDate'])
export class Invoice extends BaseEntity {
  @Column({ name: 'invoice_number', unique: true, nullable: true })
  @Index()
  invoiceNumber: string;

  @Column({ name: 'case_id', nullable: true })
  @Index()
  caseId: string;

  @ManyToOne(() => Case, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Column({ name: 'client_id', nullable: true })
  @Index()
  clientId: string;

  @ManyToOne(() => Client, (client) => client.invoices)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'client_name', type: 'varchar', length: 255, nullable: true })
  clientName: string;

  @Column({ name: 'matter_description', type: 'varchar', length: 500, nullable: true })
  matterDescription: string;

  @Column({ name: 'invoice_date', type: 'date', nullable: true })
  @Index()
  invoiceDate: Date;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  @Index()
  dueDate: Date;

  @Column({ name: 'period_start', type: 'date', nullable: true })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'date', nullable: true })
  periodEnd: Date;

  @Column({
    name: 'billing_model',
    type: 'enum',
    enum: BillingModel,
    default: BillingModel.HOURLY,
  })
  billingModel: BillingModel;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  @Index()
  status: InvoiceStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ name: 'balance_due', type: 'decimal', precision: 10, scale: 2, default: 0 })
  balanceDue: number;

  @Column({ name: 'time_charges', type: 'decimal', precision: 10, scale: 2, default: 0 })
  timeCharges: number;

  @Column({ name: 'expense_charges', type: 'decimal', precision: 10, scale: 2, default: 0 })
  expenseCharges: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ name: 'billing_address', type: 'varchar', length: 500, nullable: true })
  billingAddress: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  jurisdiction: string;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ name: 'sent_by', type: 'uuid', nullable: true })
  sentBy: string;

  @Column({ name: 'viewed_at', type: 'timestamp', nullable: true })
  viewedAt: Date;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ name: 'payment_method', type: 'varchar', length: 100, nullable: true })
  paymentMethod: string;

  @Column({ name: 'payment_reference', type: 'varchar', length: 255, nullable: true })
  paymentReference: string;

  @Column({ name: 'fee_agreement_id', type: 'uuid', nullable: true })
  feeAgreementId: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ name: 'pdf_url', type: 'varchar', length: 255, nullable: true })
  pdfUrl: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;
}
