import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * BillingTransaction Entity
 *
 * Tracks all billing transactions including payments, refunds, credits, and adjustments.
 * Integrates with invoicing, trust accounting, and payment processing systems.
 * Supports LEDES billing format and complex legal billing scenarios.
 */
@Entity('billing_transactions')
@Index(['organizationId'])
@Index(['clientId'])
@Index(['invoiceId'])
@Index(['transactionType'])
@Index(['status'])
@Index(['transactionDate'])
@Index(['paymentMethod'])
export class BillingTransaction extends BaseEntity {
  @ApiProperty({ description: 'Organization ID' })
  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId!: string;

  @ApiProperty({ description: 'Client ID this transaction belongs to' })
  @Column({ name: 'client_id', type: 'uuid' })
  @Index()
  clientId!: string;

  @ApiProperty({ description: 'Related invoice ID', nullable: true })
  @Column({ name: 'invoice_id', type: 'uuid', nullable: true })
  @Index()
  invoiceId!: string;

  @ApiProperty({ description: 'Related case/matter ID', nullable: true })
  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  @Index()
  caseId!: string;

  @ApiProperty({ description: 'Trust account ID if applicable', nullable: true })
  @Column({ name: 'trust_account_id', type: 'uuid', nullable: true })
  trustAccountId!: string;

  @ApiProperty({ description: 'Transaction type', enum: ['payment', 'refund', 'credit', 'debit', 'adjustment', 'write_off', 'trust_deposit', 'trust_withdrawal', 'retainer', 'fee', 'expense', 'discount', 'late_fee'] })
  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: [
      'payment',
      'refund',
      'credit',
      'debit',
      'adjustment',
      'write_off',
      'trust_deposit',
      'trust_withdrawal',
      'retainer',
      'fee',
      'expense',
      'discount',
      'late_fee',
    ],
  })
  transactionType!: string;

  @ApiProperty({ description: 'Transaction number (unique identifier)' })
  @Column({ name: 'transaction_number', type: 'varchar', length: 100, unique: true })
  @Index({ unique: true })
  transactionNumber!: string;

  @ApiProperty({ description: 'Transaction date and time' })
  @Column({ name: 'transaction_date', type: 'timestamp' })
  transactionDate!: Date;

  @ApiProperty({ description: 'Transaction amount' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @ApiProperty({ description: 'Payment method', enum: ['cash', 'check', 'credit_card', 'debit_card', 'ach', 'wire_transfer', 'paypal', 'stripe', 'square', 'venmo', 'zelle', 'other'] })
  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: [
      'cash',
      'check',
      'credit_card',
      'debit_card',
      'ach',
      'wire_transfer',
      'paypal',
      'stripe',
      'square',
      'venmo',
      'zelle',
      'other',
    ],
    nullable: true,
  })
  paymentMethod!: string;

  @ApiProperty({ description: 'Payment processor', example: 'Stripe' })
  @Column({ name: 'payment_processor', type: 'varchar', length: 100, nullable: true })
  paymentProcessor!: string;

  @ApiProperty({ description: 'External transaction ID from payment processor', nullable: true })
  @Column({ name: 'external_transaction_id', type: 'varchar', length: 255, nullable: true })
  @Index()
  externalTransactionId!: string;

  @ApiProperty({ description: 'Check number if payment by check', nullable: true })
  @Column({ name: 'check_number', type: 'varchar', length: 50, nullable: true })
  checkNumber!: string;

  @ApiProperty({ description: 'Last 4 digits of card', nullable: true })
  @Column({ name: 'card_last4', type: 'varchar', length: 4, nullable: true })
  cardLast4!: string;

  @ApiProperty({ description: 'Card brand', nullable: true })
  @Column({ name: 'card_brand', type: 'varchar', length: 50, nullable: true })
  cardBrand!: string;

  @ApiProperty({ description: 'Bank account last 4 digits', nullable: true })
  @Column({ name: 'bank_account_last4', type: 'varchar', length: 4, nullable: true })
  bankAccountLast4!: string;

  @ApiProperty({ description: 'Transaction status', enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded', 'disputed', 'reversed'] })
  @Column({
    type: 'enum',
    enum: [
      'pending',
      'processing',
      'completed',
      'failed',
      'cancelled',
      'refunded',
      'partially_refunded',
      'disputed',
      'reversed',
    ],
    default: 'pending',
  })
  status!: string;

  @ApiProperty({ description: 'Processing fee charged by payment processor' })
  @Column({ name: 'processing_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  processingFee!: number;

  @ApiProperty({ description: 'Net amount after fees' })
  @Column({ name: 'net_amount', type: 'decimal', precision: 15, scale: 2 })
  netAmount!: number;

  @ApiProperty({ description: 'Tax amount', nullable: true })
  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  taxAmount!: number;

  @ApiProperty({ description: 'Discount amount', nullable: true })
  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountAmount!: number;

  @ApiProperty({ description: 'Description of transaction' })
  @Column({ type: 'text' })
  description!: string;

  @ApiProperty({ description: 'Internal notes', nullable: true })
  @Column({ type: 'text', nullable: true })
  notes!: string;

  @ApiProperty({ description: 'Payer name', nullable: true })
  @Column({ name: 'payer_name', type: 'varchar', length: 255, nullable: true })
  payerName!: string;

  @ApiProperty({ description: 'Payer email', nullable: true })
  @Column({ name: 'payer_email', type: 'varchar', length: 255, nullable: true })
  payerEmail!: string;

  @ApiProperty({ description: 'Billing address', nullable: true })
  @Column({ name: 'billing_address', type: 'jsonb', nullable: true })
  billingAddress!: Record<string, string>;

  @ApiProperty({ description: 'Is this a recurring payment' })
  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring!: boolean;

  @ApiProperty({ description: 'Recurring schedule', nullable: true })
  @Column({ name: 'recurring_schedule', type: 'varchar', length: 50, nullable: true })
  recurringSchedule!: string;

  @ApiProperty({ description: 'Next recurring payment date', nullable: true })
  @Column({ name: 'next_payment_date', type: 'date', nullable: true })
  nextPaymentDate!: Date;

  @ApiProperty({ description: 'Reconciliation status', enum: ['unreconciled', 'reconciled', 'discrepancy', 'pending_review'] })
  @Column({
    name: 'reconciliation_status',
    type: 'enum',
    enum: ['unreconciled', 'reconciled', 'discrepancy', 'pending_review'],
    default: 'unreconciled',
  })
  reconciliationStatus!: string;

  @ApiProperty({ description: 'Reconciled at timestamp', nullable: true })
  @Column({ name: 'reconciled_at', type: 'timestamp', nullable: true })
  reconciledAt!: Date;

  @ApiProperty({ description: 'Reconciled by user ID', nullable: true })
  @Column({ name: 'reconciled_by', type: 'uuid', nullable: true })
  reconciledBy!: string;

  @ApiProperty({ description: 'Posted to general ledger' })
  @Column({ name: 'posted_to_gl', type: 'boolean', default: false })
  postedToGl!: boolean;

  @ApiProperty({ description: 'GL account code', nullable: true })
  @Column({ name: 'gl_account_code', type: 'varchar', length: 100, nullable: true })
  glAccountCode!: string;

  @ApiProperty({ description: 'Posted to GL at timestamp', nullable: true })
  @Column({ name: 'posted_to_gl_at', type: 'timestamp', nullable: true })
  postedToGlAt!: Date;

  @ApiProperty({ description: 'LEDES billing code', nullable: true })
  @Column({ name: 'ledes_code', type: 'varchar', length: 50, nullable: true })
  ledesCode!: string;

  @ApiProperty({ description: 'LEDES format version', nullable: true })
  @Column({ name: 'ledes_version', type: 'varchar', length: 20, nullable: true })
  ledesVersion!: string;

  @ApiProperty({ description: 'UTBMS task code', nullable: true })
  @Column({ name: 'utbms_task_code', type: 'varchar', length: 20, nullable: true })
  utbmsTaskCode!: string;

  @ApiProperty({ description: 'UTBMS activity code', nullable: true })
  @Column({ name: 'utbms_activity_code', type: 'varchar', length: 20, nullable: true })
  utbmsActivityCode!: string;

  @ApiProperty({ description: 'UTBMS expense code', nullable: true })
  @Column({ name: 'utbms_expense_code', type: 'varchar', length: 20, nullable: true })
  utbmsExpenseCode!: string;

  @ApiProperty({ description: 'Failure reason if transaction failed', nullable: true })
  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason!: string;

  @ApiProperty({ description: 'Failure code from processor', nullable: true })
  @Column({ name: 'failure_code', type: 'varchar', length: 100, nullable: true })
  failureCode!: string;

  @ApiProperty({ description: 'Refund reason', nullable: true })
  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason!: string;

  @ApiProperty({ description: 'Refunded amount', nullable: true })
  @Column({ name: 'refunded_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  refundedAmount!: number;

  @ApiProperty({ description: 'Parent transaction ID (for refunds/adjustments)', nullable: true })
  @Column({ name: 'parent_transaction_id', type: 'uuid', nullable: true })
  @Index()
  parentTransactionId!: string;

  @ApiProperty({ description: 'Related transactions', type: 'array' })
  @Column({ name: 'related_transaction_ids', type: 'text', array: true, default: '{}' })
  relatedTransactionIds!: string[];

  @ApiProperty({ description: 'Receipt URL', nullable: true })
  @Column({ name: 'receipt_url', type: 'text', nullable: true })
  receiptUrl!: string;

  @ApiProperty({ description: 'Receipt sent to client' })
  @Column({ name: 'receipt_sent', type: 'boolean', default: false })
  receiptSent!: boolean;

  @ApiProperty({ description: 'Receipt sent at timestamp', nullable: true })
  @Column({ name: 'receipt_sent_at', type: 'timestamp', nullable: true })
  receiptSentAt!: Date;

  @ApiProperty({ description: 'Notification sent to user' })
  @Column({ name: 'notification_sent', type: 'boolean', default: false })
  notificationSent!: boolean;

  @ApiProperty({ description: 'IP address of transaction initiator', nullable: true })
  @Column({ name: 'ip_address', type: 'varchar', length: 100, nullable: true })
  ipAddress!: string;

  @ApiProperty({ description: 'User agent string', nullable: true })
  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string;

  @ApiProperty({ description: 'Risk score (0-100)', nullable: true })
  @Column({ name: 'risk_score', type: 'integer', nullable: true })
  riskScore!: number;

  @ApiProperty({ description: 'Fraud check status', enum: ['not_checked', 'passed', 'flagged', 'blocked'] })
  @Column({
    name: 'fraud_check_status',
    type: 'enum',
    enum: ['not_checked', 'passed', 'flagged', 'blocked'],
    default: 'not_checked',
  })
  fraudCheckStatus!: string;

  @ApiProperty({ description: 'Dispute status', enum: ['none', 'pending', 'won', 'lost', 'resolved'] })
  @Column({
    name: 'dispute_status',
    type: 'enum',
    enum: ['none', 'pending', 'won', 'lost', 'resolved'],
    default: 'none',
  })
  disputeStatus!: string;

  @ApiProperty({ description: 'Dispute reason', nullable: true })
  @Column({ name: 'dispute_reason', type: 'text', nullable: true })
  disputeReason!: string;

  @ApiProperty({ description: 'Dispute opened at timestamp', nullable: true })
  @Column({ name: 'dispute_opened_at', type: 'timestamp', nullable: true })
  disputeOpenedAt!: Date;

  @ApiProperty({ description: 'Dispute resolved at timestamp', nullable: true })
  @Column({ name: 'dispute_resolved_at', type: 'timestamp', nullable: true })
  disputeResolvedAt!: Date;

  @ApiProperty({ description: 'Processed by user ID', nullable: true })
  @Column({ name: 'processed_by_user_id', type: 'uuid', nullable: true })
  processedByUserId!: string;

  @ApiProperty({ description: 'Approved by user ID', nullable: true })
  @Column({ name: 'approved_by_user_id', type: 'uuid', nullable: true })
  approvedByUserId!: string;

  @ApiProperty({ description: 'Tags for categorization', type: 'array' })
  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @ApiProperty({ description: 'Additional metadata (JSON)', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @ApiProperty({ description: 'Payment processor response (JSON)', nullable: true })
  @Column({ name: 'processor_response', type: 'jsonb', nullable: true })
  processorResponse!: Record<string, unknown>;

  @ApiProperty({ description: 'Webhook data (JSON)', nullable: true })
  @Column({ name: 'webhook_data', type: 'jsonb', nullable: true })
  webhookData!: Record<string, unknown>;

  @ApiProperty({ description: 'Is test transaction' })
  @Column({ name: 'is_test', type: 'boolean', default: false })
  isTest!: boolean;

  @ApiProperty({ description: 'Voided flag' })
  @Column({ name: 'is_voided', type: 'boolean', default: false })
  isVoided!: boolean;

  @ApiProperty({ description: 'Voided at timestamp', nullable: true })
  @Column({ name: 'voided_at', type: 'timestamp', nullable: true })
  voidedAt!: Date;

  @ApiProperty({ description: 'Voided by user ID', nullable: true })
  @Column({ name: 'voided_by', type: 'uuid', nullable: true })
  voidedBy!: string;

  @ApiProperty({ description: 'Void reason', nullable: true })
  @Column({ name: 'void_reason', type: 'text', nullable: true })
  voidReason!: string;
}
