import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Client } from '@clients/entities/client.entity';

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  ACH = 'ach',
  WIRE_TRANSFER = 'wire_transfer',
  CHECK = 'check',
  TRUST_ACCOUNT = 'trust_account',
  RETAINER = 'retainer',
  PAYPAL = 'paypal',
  VENMO = 'venmo',
  ZELLE = 'zelle',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

@Entity('payment_records')
@Index(['invoiceId', 'status'])
@Index(['clientId', 'paymentDate'])
@Index(['status', 'paymentDate'])
@Index(['paymentMethod', 'status'])
export class PaymentRecord extends BaseEntity {
  @Column({ name: 'invoice_id' })
  @Index()
  invoiceId!: string;

  @ManyToOne(() => Invoice, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice!: Invoice;

  @Column({ name: 'client_id' })
  @Index()
  clientId!: string;

  @ManyToOne(() => Client, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @Column({ name: 'payment_date', type: 'timestamp with time zone' })
  @Index()
  paymentDate!: Date;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod!: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @Index()
  status!: PaymentStatus;

  @Column({ name: 'reference_number', type: 'varchar', length: 255, nullable: true })
  @Index()
  referenceNumber!: string;

  @Column({ name: 'transaction_id', type: 'varchar', length: 255, nullable: true })
  @Index()
  transactionId!: string;

  @Column({ name: 'check_number', type: 'varchar', length: 50, nullable: true })
  checkNumber!: string;

  @Column({ name: 'card_last_four', type: 'varchar', length: 4, nullable: true })
  cardLastFour!: string;

  @Column({ name: 'card_type', type: 'varchar', length: 50, nullable: true })
  cardType!: string;

  @Column({ name: 'processor', type: 'varchar', length: 100, nullable: true })
  processor!: string; // Stripe, Square, LawPay, etc.

  @Column({ name: 'processor_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  processorFee!: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  netAmount!: number; // amount - processorFee

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes!: string;

  @Column({ name: 'receipt_url', type: 'varchar', length: 500, nullable: true })
  receiptUrl!: string;

  @Column({ name: 'receipt_number', type: 'varchar', length: 100, nullable: true })
  @Index()
  receiptNumber!: string;

  @Column({ name: 'receipt_sent', type: 'boolean', default: false })
  receiptSent!: boolean;

  @Column({ name: 'receipt_sent_at', type: 'timestamp', nullable: true })
  receiptSentAt!: Date;

  @Column({ name: 'applied_to_trust', type: 'boolean', default: false })
  appliedToTrust!: boolean;

  @Column({ name: 'trust_transaction_id', type: 'uuid', nullable: true })
  trustTransactionId!: string;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  refundAmount!: number;

  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refundedAt!: Date;

  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason!: string;

  @Column({ name: 'dispute_reason', type: 'text', nullable: true })
  disputeReason!: string;

  @Column({ name: 'disputed_at', type: 'timestamp', nullable: true })
  disputedAt!: Date;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt!: Date;

  @Column({ name: 'failed_at', type: 'timestamp', nullable: true })
  failedAt!: Date;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason!: string;

  @Column({ name: 'payment_gateway_response', type: 'jsonb', nullable: true })
  paymentGatewayResponse!: Record<string, any>;

  @Column({ name: 'recorded_by', type: 'uuid', nullable: true })
  recordedBy!: string;

  @Column({ name: 'reconciled', type: 'boolean', default: false })
  reconciled!: boolean;

  @Column({ name: 'reconciled_at', type: 'timestamp', nullable: true })
  reconciledAt!: Date;

  @Column({ name: 'bank_deposit_date', type: 'date', nullable: true })
  bankDepositDate!: Date;
}
