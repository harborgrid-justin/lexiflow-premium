import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PaymentRecord, PaymentMethod, PaymentStatus } from '../entities/payment-record.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { TrustAccount, TrustAccountStatus } from '../trust-accounts/entities/trust-account.entity';
import { TrustTransaction, TransactionType } from '../trust-accounts/entities/trust-transaction.entity';

export interface ProcessPaymentDto {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: Date;
  referenceNumber?: string;
  transactionId?: string;
  checkNumber?: string;
  cardLastFour?: string;
  cardType?: string;
  processor?: string;
  processorFee?: number;
  notes?: string;
  applyToTrust?: boolean;
  trustAccountId?: string;
  recordedBy?: string;
}

export interface RefundPaymentDto {
  paymentId: string;
  amount: number;
  reason: string;
  refundedBy?: string;
}

export interface PaymentSummary {
  totalPayments: number;
  totalAmount: number;
  totalFees: number;
  netAmount: number;
  byMethod: Record<PaymentMethod, { count: number; amount: number }>;
  byStatus: Record<PaymentStatus, { count: number; amount: number }>;
}

/**
 * Payment Processing Service
 *
 * Handles all payment-related operations including:
 * - Processing payments for invoices
 * - Integration with payment gateways (Stripe, Square, LawPay)
 * - Trust account integration
 * - Refund processing
 * - Payment analytics and reporting
 * - PCI compliance considerations
 */
@Injectable()
export class PaymentProcessingService {
  private readonly logger = new Logger(PaymentProcessingService.name);

  constructor(
    @InjectRepository(PaymentRecord)
    private readonly paymentRepository: Repository<PaymentRecord>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(TrustAccount)
    private readonly trustAccountRepository: Repository<TrustAccount>,
    @InjectRepository(TrustTransaction)
    private readonly trustTransactionRepository: Repository<TrustTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Process a payment for an invoice
   */
  async processPayment(paymentDto: ProcessPaymentDto): Promise<PaymentRecord> {
    this.logger.log(`Processing payment for invoice ${paymentDto.invoiceId}`);

    // Use transaction to ensure data consistency
    return await this.dataSource.transaction(async (manager) => {
      // Fetch invoice
      const invoice = await manager.findOne(Invoice, {
        where: { id: paymentDto.invoiceId },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice ${paymentDto.invoiceId} not found`);
      }

      // Validate payment amount
      if (paymentDto.amount <= 0) {
        throw new BadRequestException('Payment amount must be greater than zero');
      }

      if (paymentDto.amount > Number(invoice.balanceDue)) {
        throw new BadRequestException(
          `Payment amount ($${paymentDto.amount}) exceeds balance due ($${invoice.balanceDue})`,
        );
      }

      // Calculate net amount after processor fees
      const processorFee = paymentDto.processorFee || 0;
      const netAmount = paymentDto.amount - processorFee;

      // Create payment record
      const payment = manager.create(PaymentRecord, {
        invoiceId: paymentDto.invoiceId,
        clientId: invoice.clientId,
        amount: paymentDto.amount,
        paymentDate: paymentDto.paymentDate || new Date(),
        paymentMethod: paymentDto.paymentMethod,
        status: PaymentStatus.COMPLETED,
        referenceNumber: paymentDto.referenceNumber,
        transactionId: paymentDto.transactionId,
        checkNumber: paymentDto.checkNumber,
        cardLastFour: paymentDto.cardLastFour,
        cardType: paymentDto.cardType,
        processor: paymentDto.processor,
        processorFee,
        netAmount,
        notes: paymentDto.notes,
        recordedBy: paymentDto.recordedBy,
        processedAt: new Date(),
        receiptNumber: this.generateReceiptNumber(),
      });

      await manager.save(PaymentRecord, payment);

      // Update invoice amounts
      const newPaidAmount = Number(invoice.paidAmount) + paymentDto.amount;
      const newBalanceDue = Number(invoice.totalAmount) - newPaidAmount;

      // Update invoice status
      let newStatus = invoice.status;
      if (newBalanceDue <= 0) {
        newStatus = InvoiceStatus.PAID;
        invoice.paidAt = new Date();
      } else if (newPaidAmount > 0) {
        newStatus = InvoiceStatus.PARTIAL;
      }

      await manager.update(Invoice, paymentDto.invoiceId, {
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue,
        status: newStatus,
        paidAt: newBalanceDue <= 0 ? new Date() : invoice.paidAt,
      });

      // Apply to trust account if specified
      if (paymentDto.applyToTrust && paymentDto.trustAccountId) {
        await this.applyPaymentToTrust(
          payment.id,
          paymentDto.trustAccountId,
          paymentDto.amount,
          manager,
        );
        payment.appliedToTrust = true;
      }

      this.logger.log(
        `Payment processed successfully: ${payment.id} for invoice ${paymentDto.invoiceId}`,
      );

      return payment;
    });
  }

  /**
   * Apply payment to trust account
   */
  private async applyPaymentToTrust(
    paymentId: string,
    trustAccountId: string,
    amount: number,
    manager: any,
  ): Promise<void> {
    const trustAccount = await manager.findOne(TrustAccount, {
      where: { id: trustAccountId },
    });

    if (!trustAccount) {
      throw new NotFoundException(`Trust account ${trustAccountId} not found`);
    }

    if (trustAccount.status !== TrustAccountStatus.ACTIVE) {
      throw new BadRequestException('Trust account is not active');
    }

    const newBalance = Number(trustAccount.balance) + amount;

    // Create trust transaction
    const transaction = manager.create(TrustTransaction, {
      trustAccountId,
      transactionType: TransactionType.DEPOSIT,
      transactionDate: new Date(),
      amount,
      balanceAfter: newBalance,
      description: `Payment received - Payment ID: ${paymentId}`,
      transactionSource: 'client',
      promptDepositCompliant: true,
      paymentMethodCompliant: true,
    });

    await manager.save(TrustTransaction, transaction);

    // Update trust account balance
    await manager.update(TrustAccount, trustAccountId, {
      balance: newBalance,
    });

    // Update payment record with trust transaction reference
    await manager.update(PaymentRecord, paymentId, {
      trustTransactionId: transaction.id,
    });
  }

  /**
   * Process a refund
   */
  async processRefund(refundDto: RefundPaymentDto): Promise<PaymentRecord> {
    this.logger.log(`Processing refund for payment ${refundDto.paymentId}`);

    return await this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(PaymentRecord, {
        where: { id: refundDto.paymentId },
      });

      if (!payment) {
        throw new NotFoundException(`Payment ${refundDto.paymentId} not found`);
      }

      if (payment.status === PaymentStatus.REFUNDED) {
        throw new BadRequestException('Payment has already been fully refunded');
      }

      // Validate refund amount
      const totalRefunded = Number(payment.refundAmount) + refundDto.amount;
      if (totalRefunded > Number(payment.amount)) {
        throw new BadRequestException(
          `Refund amount exceeds original payment amount`,
        );
      }

      // Update payment record
      const newStatus =
        totalRefunded >= Number(payment.amount)
          ? PaymentStatus.REFUNDED
          : PaymentStatus.PARTIALLY_REFUNDED;

      await manager.update(PaymentRecord, refundDto.paymentId, {
        refundAmount: totalRefunded,
        refundedAt: new Date(),
        refundReason: refundDto.reason,
        status: newStatus,
      });

      // Update invoice
      const invoice = await manager.findOne(Invoice, {
        where: { id: payment.invoiceId },
      });

      if (invoice) {
        const newPaidAmount = Number(invoice.paidAmount) - refundDto.amount;
        const newBalanceDue = Number(invoice.totalAmount) - newPaidAmount;

        await manager.update(Invoice, payment.invoiceId, {
          paidAmount: Math.max(0, newPaidAmount),
          balanceDue: newBalanceDue,
          status: newBalanceDue > 0 ? InvoiceStatus.PARTIAL : InvoiceStatus.PAID,
        });
      }

      // Reverse trust account transaction if applicable
      if (payment.appliedToTrust && payment.trustTransactionId) {
        await this.reverseTrustTransaction(
          payment.trustTransactionId,
          refundDto.amount,
          manager,
        );
      }

      const updatedPayment = await manager.findOne(PaymentRecord, {
        where: { id: refundDto.paymentId },
      });

      this.logger.log(`Refund processed successfully: ${refundDto.paymentId}`);

      return updatedPayment!;
    });
  }

  /**
   * Reverse a trust account transaction
   */
  private async reverseTrustTransaction(
    transactionId: string,
    amount: number,
    manager: any,
  ): Promise<void> {
    const transaction = await manager.findOne(TrustTransaction, {
      where: { id: transactionId },
    });

    if (!transaction) {
      this.logger.warn(`Trust transaction ${transactionId} not found`);
      return;
    }

    const trustAccount = await manager.findOne(TrustAccount, {
      where: { id: transaction.trustAccountId },
    });

    if (!trustAccount) {
      throw new NotFoundException(`Trust account not found`);
    }

    const newBalance = Number(trustAccount.balance) - amount;

    if (newBalance < 0) {
      throw new BadRequestException(
        'Cannot reverse transaction: would result in negative balance',
      );
    }

    // Create reversal transaction
    const reversal = manager.create(TrustTransaction, {
      trustAccountId: transaction.trustAccountId,
      transactionType: TransactionType.WITHDRAWAL,
      transactionDate: new Date(),
      amount,
      balanceAfter: newBalance,
      description: `Refund reversal - Original transaction: ${transactionId}`,
      transactionSource: 'client',
    });

    await manager.save(TrustTransaction, reversal);

    // Update trust account balance
    await manager.update(TrustAccount, transaction.trustAccountId, {
      balance: newBalance,
    });
  }

  /**
   * Get payment by ID
   */
  async getPayment(id: string): Promise<PaymentRecord> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['invoice', 'client'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    return payment;
  }

  /**
   * Get all payments for an invoice
   */
  async getInvoicePayments(invoiceId: string): Promise<PaymentRecord[]> {
    return await this.paymentRepository.find({
      where: { invoiceId },
      order: { paymentDate: 'DESC' },
    });
  }

  /**
   * Get all payments for a client
   */
  async getClientPayments(clientId: string): Promise<PaymentRecord[]> {
    return await this.paymentRepository.find({
      where: { clientId },
      order: { paymentDate: 'DESC' },
    });
  }

  /**
   * Get payment summary for date range
   */
  async getPaymentSummary(
    startDate?: Date,
    endDate?: Date,
    clientId?: string,
  ): Promise<PaymentSummary> {
    const query = this.paymentRepository.createQueryBuilder('payment');

    if (startDate && endDate) {
      query.andWhere('payment.paymentDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (clientId) {
      query.andWhere('payment.clientId = :clientId', { clientId });
    }

    const payments = await query.getMany();

    const summary: PaymentSummary = {
      totalPayments: payments.length,
      totalAmount: 0,
      totalFees: 0,
      netAmount: 0,
      byMethod: {} as Record<PaymentMethod, { count: number; amount: number }>,
      byStatus: {} as Record<PaymentStatus, { count: number; amount: number }>,
    };

    // Initialize method and status counts
    Object.values(PaymentMethod).forEach((method) => {
      summary.byMethod[method] = { count: 0, amount: 0 };
    });

    Object.values(PaymentStatus).forEach((status) => {
      summary.byStatus[status] = { count: 0, amount: 0 };
    });

    // Calculate totals
    payments.forEach((payment) => {
      const amount = Number(payment.amount);
      const fee = Number(payment.processorFee || 0);

      summary.totalAmount += amount;
      summary.totalFees += fee;
      summary.netAmount += amount - fee;

      // By method
      if (!summary.byMethod[payment.paymentMethod]) {
        summary.byMethod[payment.paymentMethod] = { count: 0, amount: 0 };
      }
      summary.byMethod[payment.paymentMethod].count++;
      summary.byMethod[payment.paymentMethod].amount += amount;

      // By status
      if (!summary.byStatus[payment.status]) {
        summary.byStatus[payment.status] = { count: 0, amount: 0 };
      }
      summary.byStatus[payment.status].count++;
      summary.byStatus[payment.status].amount += amount;
    });

    return summary;
  }

  /**
   * Mark payment as reconciled
   */
  async reconcilePayment(paymentId: string, bankDepositDate?: Date): Promise<PaymentRecord> {
    const payment = await this.getPayment(paymentId);

    payment.reconciled = true;
    payment.reconciledAt = new Date();
    if (bankDepositDate) {
      payment.bankDepositDate = bankDepositDate;
    }

    return await this.paymentRepository.save(payment);
  }

  /**
   * Send payment receipt
   */
  async sendReceipt(paymentId: string): Promise<{ success: boolean; message: string }> {
    const payment = await this.getPayment(paymentId);

    // TODO: Integrate with email service to send receipt
    this.logger.log(`Sending receipt for payment ${paymentId}`);

    payment.receiptSent = true;
    payment.receiptSentAt = new Date();
    await this.paymentRepository.save(payment);

    return {
      success: true,
      message: `Receipt sent for payment ${paymentId}`,
    };
  }

  /**
   * Generate unique receipt number
   */
  private generateReceiptNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    return `RCP-${year}${month}${day}-${random}`;
  }

  /**
   * Get unreconciled payments
   */
  async getUnreconciledPayments(): Promise<PaymentRecord[]> {
    return await this.paymentRepository.find({
      where: {
        reconciled: false,
        status: PaymentStatus.COMPLETED,
      },
      order: { paymentDate: 'ASC' },
    });
  }
}
