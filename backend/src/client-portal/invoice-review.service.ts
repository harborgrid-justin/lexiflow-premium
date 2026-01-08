import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortalUser } from './entities/portal-user.entity';

// Note: We're using the existing Invoice entity from the billing module
// This service provides a portal-specific view of invoices

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  clientId: string;
  matterId?: string;
  invoiceDate: Date;
  dueDate: Date;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: string;
  items: InvoiceItem[];
  paymentHistory: PaymentRecord[];
  metadata?: Record<string, unknown>;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  date?: Date;
  attorney?: string;
}

interface PaymentRecord {
  id: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  transactionId?: string;
  status: string;
}

@Injectable()
export class InvoiceReviewService {
  constructor(
    @InjectRepository(PortalUser)
    private readonly portalUserRepository: Repository<PortalUser>,
  ) {}

  /**
   * Get all invoices for a portal user's client
   */
  async getInvoices(portalUserId: string, filters?: {
    status?: string;
    matterId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ invoices: InvoiceData[]; total: number; summary: InvoiceSummary }> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { id: portalUserId },
      relations: ['client', 'client.invoices'],
    });

    if (!portalUser) {
      throw new NotFoundException('Portal user not found');
    }

    // In a real implementation, this would query the Invoice entity
    // For now, we'll return mock data structure
    // TODO: Implement actual invoice querying from billing module

    const mockInvoices: InvoiceData[] = [];
    const summary = this.calculateInvoiceSummary(mockInvoices);

    return {
      invoices: mockInvoices,
      total: mockInvoices.length,
      summary,
    };
  }

  /**
   * Get a specific invoice by ID
   */
  async getInvoice(invoiceId: string, portalUserId: string): Promise<InvoiceData> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { id: portalUserId },
      relations: ['client'],
    });

    if (!portalUser) {
      throw new NotFoundException('Portal user not found');
    }

    // TODO: Implement actual invoice retrieval from billing module
    // Verify that the invoice belongs to the portal user's client

    throw new NotFoundException('Invoice not found or access denied');
  }

  /**
   * Get invoice summary for a portal user
   */
  async getInvoiceSummary(portalUserId: string): Promise<InvoiceSummary> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { id: portalUserId },
      relations: ['client', 'client.invoices'],
    });

    if (!portalUser) {
      throw new NotFoundException('Portal user not found');
    }

    // TODO: Calculate actual summary from billing module
    const mockInvoices: InvoiceData[] = [];
    return this.calculateInvoiceSummary(mockInvoices);
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(portalUserId: string): Promise<InvoiceData[]> {
    const { invoices } = await this.getInvoices(portalUserId, {
      status: 'overdue',
    });

    return invoices;
  }

  /**
   * Get unpaid invoices
   */
  async getUnpaidInvoices(portalUserId: string): Promise<InvoiceData[]> {
    const { invoices } = await this.getInvoices(portalUserId);

    return invoices.filter((inv) => inv.balance > 0);
  }

  /**
   * Get payment history for a client
   */
  async getPaymentHistory(
    portalUserId: string,
    filters?: {
      dateFrom?: Date;
      dateTo?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ payments: PaymentRecord[]; total: number }> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { id: portalUserId },
      relations: ['client'],
    });

    if (!portalUser) {
      throw new NotFoundException('Portal user not found');
    }

    // TODO: Implement actual payment history retrieval from billing module
    const mockPayments: PaymentRecord[] = [];

    return {
      payments: mockPayments,
      total: mockPayments.length,
    };
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(invoiceId: string, portalUserId: string): Promise<{
    filename: string;
    buffer: Buffer;
    mimeType: string;
  }> {
    // Verify access to invoice
    await this.getInvoice(invoiceId, portalUserId);

    // TODO: Generate or retrieve invoice PDF from billing module
    throw new NotFoundException('Invoice PDF not available');
  }

  /**
   * Request invoice dispute/clarification
   */
  async requestInvoiceClarification(
    invoiceId: string,
    portalUserId: string,
    data: {
      lineItems?: string[];
      message: string;
      requestType: 'clarification' | 'dispute' | 'adjustment';
    },
  ): Promise<{
    requestId: string;
    status: string;
    message: string;
  }> {
    // Verify access to invoice
    await this.getInvoice(invoiceId, portalUserId);

    // TODO: Create a clarification request in the system
    // This would typically create a message or ticket

    return {
      requestId: 'mock-request-id',
      status: 'submitted',
      message: 'Your request has been submitted and will be reviewed shortly.',
    };
  }

  /**
   * Get invoice statistics
   */
  async getInvoiceStatistics(portalUserId: string, period?: {
    startDate: Date;
    endDate: Date;
  }): Promise<{
    totalInvoiced: number;
    totalPaid: number;
    totalOutstanding: number;
    averageInvoiceAmount: number;
    invoiceCount: number;
    paymentCount: number;
    overdueDays: number;
    byMatter: Array<{
      matterId: string;
      matterName: string;
      totalAmount: number;
      paidAmount: number;
      balance: number;
    }>;
  }> {
    const { invoices } = await this.getInvoices(portalUserId);

    let filteredInvoices = invoices;
    if (period) {
      filteredInvoices = invoices.filter(
        (inv) => inv.invoiceDate >= period.startDate && inv.invoiceDate <= period.endDate,
      );
    }

    const stats = {
      totalInvoiced: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      averageInvoiceAmount: 0,
      invoiceCount: filteredInvoices.length,
      paymentCount: 0,
      overdueDays: 0,
      byMatter: [] as Array<{
        matterId: string;
        matterName: string;
        totalAmount: number;
        paidAmount: number;
        balance: number;
      }>,
    };

    const matterStats = new Map<string, {
      matterId: string;
      matterName: string;
      totalAmount: number;
      paidAmount: number;
      balance: number;
    }>();

    filteredInvoices.forEach((inv) => {
      stats.totalInvoiced += inv.totalAmount;
      stats.totalPaid += inv.amountPaid;
      stats.totalOutstanding += inv.balance;
      stats.paymentCount += inv.paymentHistory.length;

      if (inv.matterId) {
        const existing = matterStats.get(inv.matterId) || {
          matterId: inv.matterId,
          matterName: `Matter ${inv.matterId}`,
          totalAmount: 0,
          paidAmount: 0,
          balance: 0,
        };

        existing.totalAmount += inv.totalAmount;
        existing.paidAmount += inv.amountPaid;
        existing.balance += inv.balance;

        matterStats.set(inv.matterId, existing);
      }
    });

    stats.averageInvoiceAmount = stats.invoiceCount > 0 ? stats.totalInvoiced / stats.invoiceCount : 0;
    stats.byMatter = Array.from(matterStats.values());

    return stats;
  }

  /**
   * Calculate invoice summary (helper method)
   */
  private calculateInvoiceSummary(invoices: InvoiceData[]): InvoiceSummary {
    const summary: InvoiceSummary = {
      totalInvoiced: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      overdueAmount: 0,
      invoiceCount: invoices.length,
      paidInvoiceCount: 0,
      unpaidInvoiceCount: 0,
      overdueInvoiceCount: 0,
    };

    const now = new Date();

    invoices.forEach((inv) => {
      summary.totalInvoiced += inv.totalAmount;
      summary.totalPaid += inv.amountPaid;
      summary.totalOutstanding += inv.balance;

      if (inv.balance === 0) {
        summary.paidInvoiceCount += 1;
      } else {
        summary.unpaidInvoiceCount += 1;

        if (inv.dueDate < now) {
          summary.overdueInvoiceCount += 1;
          summary.overdueAmount += inv.balance;
        }
      }
    });

    return summary;
  }
}

interface InvoiceSummary {
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueAmount: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  unpaidInvoiceCount: number;
  overdueInvoiceCount: number;
}
