import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Case } from '@cases/entities/case.entity';

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

  // COMPLIANCE: Additional reconciliation fields
  @Column({ name: 'bank_statement_date', type: 'date', nullable: true })
  bankStatementDate?: Date;

  @Column({ name: 'cleared_date', type: 'date', nullable: true })
  clearedDate?: Date;

  // COMPLIANCE: Deposit and Withdrawal Rules
  @Column({ name: 'funds_received_date', type: 'timestamp', nullable: true })
  fundsReceivedDate?: Date;

  @Column({ name: 'prompt_deposit_compliant', type: 'boolean', nullable: true })
  promptDepositCompliant?: boolean;

  @Column({ name: 'is_advanced_fee', type: 'boolean', default: false })
  isAdvancedFee!: boolean;

  @Column({ name: 'is_earned_fee', type: 'boolean', default: false })
  isEarnedFee!: boolean;

  @Column({ name: 'transaction_source', type: 'varchar', length: 50, nullable: true })
  transactionSource?: string; // 'client' | 'firm' | 'third_party'

  @Column({ name: 'is_operating_fund_transfer', type: 'boolean', default: false })
  isOperatingFundTransfer!: boolean;

  @Column({ name: 'check_voided', type: 'boolean', default: false })
  checkVoided!: boolean;

  @Column({ name: 'payment_method_compliant', type: 'boolean', default: true })
  paymentMethodCompliant!: boolean;

  @Column({ name: 'signatory_authorized', type: 'boolean', nullable: true })
  signatoryAuthorized?: boolean;

  // COMPLIANCE: Communication and Disputed Funds
  @Column({ name: 'client_notified', type: 'boolean', default: false })
  clientNotified!: boolean;

  @Column({ name: 'client_notified_date', type: 'timestamp', nullable: true })
  clientNotifiedDate?: Date;

  @Column({ name: 'disputed_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  disputedAmount?: number;

  @Column({ name: 'dispute_reason', type: 'text', nullable: true })
  disputeReason?: string;

  @Column({ name: 'dispute_resolved_date', type: 'date', nullable: true })
  disputeResolvedDate?: Date;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments!: string[];

  @Column({ name: 'document_path', type: 'varchar', length: 500, nullable: true })
  documentPath!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  // COMPLIANCE: Record Retention
  @Column({ name: 'retention_expiry_date', type: 'date', nullable: true })
  retentionExpiryDate?: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
