import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

export enum InvoiceStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  VIEWED = 'Viewed',
  PARTIAL = 'Partial',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
  WRITTEN_OFF = 'Written Off',
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
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_number', unique: true })
  @Index()
  invoiceNumber: string;

  @Column({ name: 'case_id' })
  @Index()
  caseId: string;

  @Column({ name: 'client_id' })
  @Index()
  clientId: string;

  @Column({ type: 'varchar', length: 255 })
  clientName: string;

  @Column({ type: 'varchar', length: 500 })
  matterDescription: string;

  @Column({ type: 'date' })
  @Index()
  invoiceDate: string;

  @Column({ type: 'date' })
  @Index()
  dueDate: string;

  @Column({ type: 'date', nullable: true })
  periodStart: string;

  @Column({ type: 'date', nullable: true })
  periodEnd: string;

  @Column({
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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balanceDue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  timeCharges: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  expenseCharges: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  billingAddress: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  jurisdiction: string;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'uuid', nullable: true })
  sentBy: string;

  @Column({ type: 'timestamp', nullable: true })
  viewedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentReference: string;

  @Column({ type: 'uuid', nullable: true })
  feeAgreementId: string;

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pdfUrl: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
