import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  VersionColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Case } from '../../../cases/entities/case.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  INTEREST = 'interest',
  FEE = 'fee',
  ADJUSTMENT = 'adjustment',
  REFUND = 'refund',
}

export enum TransactionStatus {
  PENDING = 'pending',
  CLEARED = 'cleared',
  RECONCILED = 'reconciled',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

@Entity('trust_transactions')
@Index(['trustAccountId', 'transactionDate'])
@Index(['transactionType', 'transactionDate'])
@Index(['status'])
@Index(['caseId'])
export class TrustTransaction extends BaseEntity {
  @Column({ name: 'trust_account_id', type: 'uuid' })
  @Index()
  trustAccountId!: string;

  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  caseId!: string;

  @ManyToOne(() => Case)
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'client_id', type: 'uuid', nullable: true })
  clientId!: string;

  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: TransactionType,
  })
  transactionType!: TransactionType;

  @Column({ name: 'transaction_date', type: 'date' })
  @Index()
  transactionDate!: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 15, scale: 2 })
  balanceAfter!: number;

  @Column({ type: 'varchar', length: 500 })
  description!: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({ name: 'reference_number', type: 'varchar', length: 100, nullable: true })
  referenceNumber!: string;

  @Column({ name: 'check_number', type: 'varchar', length: 100, nullable: true })
  checkNumber!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payee!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payor!: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 100, nullable: true })
  paymentMethod!: string;

  @Column({ name: 'related_invoice_id', type: 'uuid', nullable: true })
  relatedInvoiceId!: string;

  @Column({ name: 'related_transaction_id', type: 'uuid', nullable: true })
  relatedTransactionId!: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt!: Date;

  @Column({ type: 'boolean', default: false })
  reconciled!: boolean;

  @Column({ name: 'reconciled_date', type: 'date', nullable: true })
  reconciledDate!: Date;

  @Column({ name: 'reconciled_by', type: 'uuid', nullable: true })
  reconciledBy!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments!: string[];

  @Column({ name: 'document_path', type: 'varchar', length: 500, nullable: true })
  documentPath!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any>;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string;
}
