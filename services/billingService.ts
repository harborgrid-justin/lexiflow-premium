import { errorHandler } from '../utils/errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Types
export interface TimeEntry {
  id: string;
  caseId: string;
  userId: string;
  date: string;
  duration: number;
  description: string;
  activity: string;
  ledesCode?: string;
  rate: number;
  total: number;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Billed' | 'Written Off';
  billable: boolean;
  invoiceId?: string;
  rateTableId?: string;
  internalNotes?: string;
  taskCode?: string;
  discount?: number;
  discountedTotal?: number;
  approvedBy?: string;
  approvedAt?: Date;
  billedBy?: string;
  billedAt?: Date;
  phaseCode?: string;
  expenseCategory?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  caseId: string;
  clientId: string;
  clientName: string;
  invoiceDate: string;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Partial' | 'Overdue' | 'Written Off';
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentTerms?: string;
  notes?: string;
  billingAddress?: string;
  items?: InvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  date: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  type: 'Time' | 'Expense' | 'Fee';
}

export interface TrustAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: 'IOLTA' | 'Client Trust' | 'Operating';
  clientId: string;
  clientName: string;
  caseId?: string;
  balance: number;
  currency: string;
  status: 'Active' | 'Inactive' | 'Frozen' | 'Closed';
  bankName?: string;
  bankAccountNumber?: string;
  routingNumber?: string;
  purpose?: string;
  openedDate?: string;
  closedDate?: string;
  minimumBalance: number;
  interestBearing: boolean;
  notes?: string;
  responsibleAttorney?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrustTransaction {
  id: string;
  trustAccountId: string;
  transactionType: 'Deposit' | 'Withdrawal' | 'Transfer' | 'Interest' | 'Fee' | 'Adjustment';
  transactionDate: string;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceNumber?: string;
  checkNumber?: string;
  payee?: string;
  payor?: string;
  paymentMethod?: string;
  relatedInvoiceId?: string;
  relatedCaseId?: string;
  approvedBy?: string;
  approvedAt?: Date;
  reconciled: boolean;
  reconciledDate?: string;
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntryFilter {
  caseId?: string;
  userId?: string;
  invoiceId?: string;
  status?: string;
  billable?: boolean;
  startDate?: string;
  endDate?: string;
  activity?: string;
  phaseCode?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface InvoiceFilter {
  caseId?: string;
  clientId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

class BillingService {
  private async fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      errorHandler.logError(error as Error, 'BillingService:fetchAPI');
      throw error;
    }
  }

  // Time Entries
  async getTimeEntries(filter?: TimeEntryFilter): Promise<{ data: TimeEntry[]; total: number }> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return this.fetchAPI<{ data: TimeEntry[]; total: number }>(
      `/api/v1/billing/time-entries${queryString ? `?${queryString}` : ''}`
    );
  }

  async getTimeEntry(id: string): Promise<TimeEntry> {
    return this.fetchAPI<TimeEntry>(`/api/v1/billing/time-entries/${id}`);
  }

  async getTimeEntriesByCase(caseId: string): Promise<TimeEntry[]> {
    return this.fetchAPI<TimeEntry[]>(`/api/v1/billing/time-entries/case/${caseId}`);
  }

  async getUnbilledTimeEntries(caseId: string): Promise<TimeEntry[]> {
    return this.fetchAPI<TimeEntry[]>(`/api/v1/billing/time-entries/case/${caseId}/unbilled`);
  }

  async getTimeEntryTotalsByCase(
    caseId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ total: number; billable: number; billed: number; unbilled: number }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    return this.fetchAPI(
      `/api/v1/billing/time-entries/case/${caseId}/totals${queryString ? `?${queryString}` : ''}`
    );
  }

  async createTimeEntry(data: Partial<TimeEntry>): Promise<TimeEntry> {
    return this.fetchAPI<TimeEntry>('/api/v1/billing/time-entries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkCreateTimeEntries(entries: Partial<TimeEntry>[]): Promise<TimeEntry[]> {
    return this.fetchAPI<TimeEntry[]>('/api/v1/billing/time-entries/bulk', {
      method: 'POST',
      body: JSON.stringify({ entries }),
    });
  }

  async updateTimeEntry(id: string, data: Partial<TimeEntry>): Promise<TimeEntry> {
    return this.fetchAPI<TimeEntry>(`/api/v1/billing/time-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approveTimeEntry(id: string, approvedBy: string): Promise<TimeEntry> {
    return this.fetchAPI<TimeEntry>(`/api/v1/billing/time-entries/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approvedBy }),
    });
  }

  async billTimeEntry(id: string, invoiceId: string, billedBy: string): Promise<TimeEntry> {
    return this.fetchAPI<TimeEntry>(`/api/v1/billing/time-entries/${id}/bill`, {
      method: 'PUT',
      body: JSON.stringify({ invoiceId, billedBy }),
    });
  }

  async deleteTimeEntry(id: string): Promise<void> {
    await this.fetchAPI(`/api/v1/billing/time-entries/${id}`, {
      method: 'DELETE',
    });
  }

  // Invoices
  async getInvoices(filter?: InvoiceFilter): Promise<{ data: Invoice[]; total: number }> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return this.fetchAPI<{ data: Invoice[]; total: number }>(
      `/api/v1/billing/invoices${queryString ? `?${queryString}` : ''}`
    );
  }

  async getInvoice(id: string): Promise<Invoice & { items: InvoiceItem[] }> {
    return this.fetchAPI<Invoice & { items: InvoiceItem[] }>(`/api/v1/billing/invoices/${id}`);
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    return this.fetchAPI<Invoice[]>('/api/v1/billing/invoices/overdue');
  }

  async createInvoice(data: Partial<Invoice> & { items?: Partial<InvoiceItem>[] }): Promise<Invoice> {
    return this.fetchAPI<Invoice>('/api/v1/billing/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    return this.fetchAPI<Invoice>(`/api/v1/billing/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async sendInvoice(id: string, sentBy: string): Promise<Invoice> {
    return this.fetchAPI<Invoice>(`/api/v1/billing/invoices/${id}/send`, {
      method: 'POST',
      body: JSON.stringify({ sentBy }),
    });
  }

  async recordPayment(
    id: string,
    payment: { amount: number; paymentMethod?: string; paymentReference?: string }
  ): Promise<Invoice> {
    return this.fetchAPI<Invoice>(`/api/v1/billing/invoices/${id}/record-payment`, {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async generateInvoicePDF(id: string): Promise<{ url: string }> {
    return this.fetchAPI<{ url: string }>(`/api/v1/billing/invoices/${id}/pdf`);
  }

  async deleteInvoice(id: string): Promise<void> {
    await this.fetchAPI(`/api/v1/billing/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  // Trust Accounts
  async getTrustAccounts(clientId?: string, status?: string): Promise<TrustAccount[]> {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (status) params.append('status', status);
    const queryString = params.toString();
    return this.fetchAPI<TrustAccount[]>(
      `/api/v1/billing/trust-accounts${queryString ? `?${queryString}` : ''}`
    );
  }

  async getTrustAccount(id: string): Promise<TrustAccount> {
    return this.fetchAPI<TrustAccount>(`/api/v1/billing/trust-accounts/${id}`);
  }

  async getTrustAccountBalance(id: string): Promise<{ balance: number; currency: string }> {
    return this.fetchAPI<{ balance: number; currency: string }>(
      `/api/v1/billing/trust-accounts/${id}/balance`
    );
  }

  async getTrustTransactions(
    accountId: string,
    startDate?: string,
    endDate?: string
  ): Promise<TrustTransaction[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    return this.fetchAPI<TrustTransaction[]>(
      `/api/v1/billing/trust-accounts/${accountId}/transactions${queryString ? `?${queryString}` : ''}`
    );
  }

  async getLowBalanceAccounts(threshold?: number): Promise<TrustAccount[]> {
    const params = new URLSearchParams();
    if (threshold) params.append('threshold', String(threshold));
    const queryString = params.toString();
    return this.fetchAPI<TrustAccount[]>(
      `/api/v1/billing/trust-accounts/low-balance${queryString ? `?${queryString}` : ''}`
    );
  }

  async createTrustAccount(data: Partial<TrustAccount>): Promise<TrustAccount> {
    return this.fetchAPI<TrustAccount>('/api/v1/billing/trust-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTrustAccount(id: string, data: Partial<TrustAccount>): Promise<TrustAccount> {
    return this.fetchAPI<TrustAccount>(`/api/v1/billing/trust-accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async depositToTrustAccount(
    accountId: string,
    data: {
      amount: number;
      transactionDate: string;
      description: string;
      payor?: string;
      referenceNumber?: string;
      paymentMethod?: string;
      notes?: string;
    }
  ): Promise<TrustTransaction> {
    return this.fetchAPI<TrustTransaction>(`/api/v1/billing/trust-accounts/${accountId}/deposit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async withdrawFromTrustAccount(
    accountId: string,
    data: {
      amount: number;
      transactionDate: string;
      description: string;
      payee?: string;
      checkNumber?: string;
      relatedInvoiceId?: string;
      notes?: string;
    }
  ): Promise<TrustTransaction> {
    return this.fetchAPI<TrustTransaction>(`/api/v1/billing/trust-accounts/${accountId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createTrustTransaction(
    accountId: string,
    data: Partial<TrustTransaction>
  ): Promise<TrustTransaction> {
    return this.fetchAPI<TrustTransaction>(
      `/api/v1/billing/trust-accounts/${accountId}/transaction`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async deleteTrustAccount(id: string): Promise<void> {
    await this.fetchAPI(`/api/v1/billing/trust-accounts/${id}`, {
      method: 'DELETE',
    });
  }
}

export const billingService = new BillingService();
