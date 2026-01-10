/**
 * @module api/billing/enterprise-billing.service
 * @category API Services
 * @description Billing API service for financial reports, WIP, realization, and analytics (Enterprise Legacy)
 */

import { apiClient } from "@/services/infrastructure/apiClient";

// ============================================================================
// TYPES - Financial Reports
// ============================================================================

export interface ProfitabilityMetrics {
  grossRevenue: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: number;
  netProfit: number;
  netMargin: number;
  ebitda: number;
}

export interface RealizationMetrics {
  standardBillingRate: number;
  actualBillingRate: number;
  billingRealization: number;
  standardCollectionAmount: number;
  actualCollectionAmount: number;
  collectionRealization: number;
  overallRealization: number;
}

export interface WorkInProgressMetrics {
  totalWIP: number;
  unbilledTime: number;
  unbilledExpenses: number;
  billedNotCollected: number;
  averageAgeDays: number;
  writeOffAmount: number;
  writeOffPercentage: number;
}

export interface RevenueForecasting {
  month: string;
  projectedRevenue: number;
  actualRevenue: number;
  variance: number;
  variancePercent: number;
}

export interface TimekeeperPerformance {
  id: string;
  name: string;
  level: string;
  billableHours: number;
  targetHours: number;
  utilizationRate: number;
  billingRate: number;
  revenue: number;
  realization: number;
}

export interface MatterProfitability {
  id: string;
  matterNumber: string;
  matterDescription: string;
  client: string;
  totalFees: number;
  totalCosts: number;
  profit: number;
  profitMargin: number;
  hoursWorked: number;
  realizationRate: number;
}

// ============================================================================
// TYPES - Trust Accounting
// ============================================================================

export interface TrustAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  clientId: string;
  clientName: string;
  balance: number;
  availableBalance: number;
  pendingDeposits: number;
  pendingDisbursements: number;
  lastReconciliationDate: string;
  status: "active" | "inactive" | "frozen";
}

export interface TrustTransaction {
  id: string;
  accountId: string;
  type: "deposit" | "disbursement" | "transfer" | "interest" | "fee";
  amount: number;
  date: string;
  description: string;
  reference: string;
  balanceAfter: number;
  status: "pending" | "cleared" | "void";
  createdBy: string;
  matterNumber?: string;
}

export interface TrustReconciliation {
  id: string;
  accountId: string;
  period: string;
  bankBalance: number;
  bookBalance: number;
  difference: number;
  status: "reconciled" | "unreconciled" | "in_progress";
  reconciledDate?: string;
  reconciledBy?: string;
  notes?: string;
}

// ============================================================================
// TYPES - Invoice & Billing
// ============================================================================

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  matterNumber?: string;
  matterDescription?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled";
  lineItems: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  type: "time" | "expense" | "fixed_fee" | "discount";
  date?: string;
  timekeeper?: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  userName: string;
  caseId?: string;
  caseName?: string;
  date: string;
  hours: number;
  rate: number;
  amount: number;
  description: string;
  billable: boolean;
  status: "draft" | "submitted" | "approved" | "billed";
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  userName: string;
  caseId?: string;
  caseName?: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  receiptUrl?: string;
  billable: boolean;
  reimbursable: boolean;
  status: "draft" | "submitted" | "approved" | "billed" | "reimbursed";
  createdAt: string;
}

// ============================================================================
// TYPES - AR Aging
// ============================================================================

export interface ARAgingBucket {
  range: string;
  amount: number;
  count: number;
  percentage: number;
  clients: ARAgingClient[];
}

export interface ARAgingClient {
  clientId: string;
  clientName: string;
  amount: number;
  invoiceCount: number;
  oldestInvoiceDate: string;
}

// ============================================================================
// TYPES - Collections
// ============================================================================

export interface CollectionItem {
  id: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  daysOverdue: number;
  lastContactDate?: string;
  status: "pending" | "in_progress" | "promised" | "escalated" | "collected";
  notes?: string;
}

export interface WriteOffRequest {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  reason: string;
  requestedBy: string;
  requestedDate: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedDate?: string;
}

// ============================================================================
// FILTERS
// ============================================================================

export interface BillingFilters {
  startDate?: string;
  endDate?: string;
  caseId?: string;
  clientId?: string;
  userId?: string;
  status?: string;
}

// ============================================================================
// SERVICE
// ============================================================================

export class BillingApiService {
  private readonly baseUrl = "/api/billing";

  // ============================================================================
  // Financial Reports
  // ============================================================================

  async getProfitabilityMetrics(
    filters?: BillingFilters
  ): Promise<ProfitabilityMetrics> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/analytics/profitability${params}`);
  }

  async getRealizationMetrics(
    filters?: BillingFilters
  ): Promise<RealizationMetrics> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/analytics/realization${params}`);
  }

  async getWIPMetrics(
    filters?: BillingFilters
  ): Promise<WorkInProgressMetrics> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/analytics/wip${params}`);
  }

  async getRevenueForecast(
    filters?: BillingFilters
  ): Promise<RevenueForecasting[]> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/analytics/forecast${params}`);
  }

  async getTimekeeperPerformance(
    filters?: BillingFilters
  ): Promise<TimekeeperPerformance[]> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(
      `${this.baseUrl}/analytics/timekeeper-performance${params}`
    );
  }

  async getMatterProfitability(
    filters?: BillingFilters
  ): Promise<MatterProfitability[]> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(
      `${this.baseUrl}/analytics/matter-profitability${params}`
    );
  }

  // ============================================================================
  // Trust Accounting
  // ============================================================================

  async getTrustAccounts(filters?: BillingFilters): Promise<TrustAccount[]> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/trust-accounts${params}`);
  }

  async getTrustAccount(id: string): Promise<TrustAccount> {
    return apiClient.get(`${this.baseUrl}/trust-accounts/${id}`);
  }

  async createTrustAccount(data: Partial<TrustAccount>): Promise<TrustAccount> {
    return apiClient.post(`${this.baseUrl}/trust-accounts`, data);
  }

  async updateTrustAccount(
    id: string,
    data: Partial<TrustAccount>
  ): Promise<TrustAccount> {
    return apiClient.put(`${this.baseUrl}/trust-accounts/${id}`, data);
  }

  async getTrustTransactions(
    accountId: string,
    filters?: BillingFilters
  ): Promise<TrustTransaction[]> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(
      `${this.baseUrl}/trust-accounts/${accountId}/transactions${params}`
    );
  }

  async createTrustTransaction(
    accountId: string,
    data: Partial<TrustTransaction>
  ): Promise<TrustTransaction> {
    return apiClient.post(
      `${this.baseUrl}/trust-accounts/${accountId}/transactions`,
      data
    );
  }

  async getTrustReconciliations(
    accountId: string
  ): Promise<TrustReconciliation[]> {
    return apiClient.get(
      `${this.baseUrl}/trust-accounts/${accountId}/reconciliations`
    );
  }

  async createTrustReconciliation(
    accountId: string,
    data: Partial<TrustReconciliation>
  ): Promise<TrustReconciliation> {
    return apiClient.post(
      `${this.baseUrl}/trust-accounts/${accountId}/reconciliations`,
      data
    );
  }

  // ============================================================================
  // Invoices
  // ============================================================================

  async getInvoices(
    filters?: BillingFilters
  ): Promise<{ data: Invoice[]; total: number }> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/invoices${params}`);
  }

  async getInvoice(id: string): Promise<Invoice> {
    return apiClient.get(`${this.baseUrl}/invoices/${id}`);
  }

  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    return apiClient.post(`${this.baseUrl}/invoices`, data);
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    return apiClient.put(`${this.baseUrl}/invoices/${id}`, data);
  }

  async deleteInvoice(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/invoices/${id}`);
  }

  async sendInvoice(id: string): Promise<Invoice> {
    return apiClient.post(`${this.baseUrl}/invoices/${id}/send`, {});
  }

  async recordPayment(
    id: string,
    amount: number,
    paymentDate: string,
    method: string
  ): Promise<Invoice> {
    return apiClient.post(`${this.baseUrl}/invoices/${id}/payments`, {
      amount,
      paymentDate,
      method,
    });
  }

  // ============================================================================
  // Time Entries
  // ============================================================================

  async getTimeEntries(filters?: BillingFilters): Promise<TimeEntry[]> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/time-entries${params}`);
  }

  async getTimeEntry(id: string): Promise<TimeEntry> {
    return apiClient.get(`${this.baseUrl}/time-entries/${id}`);
  }

  async createTimeEntry(data: Partial<TimeEntry>): Promise<TimeEntry> {
    return apiClient.post(`${this.baseUrl}/time-entries`, data);
  }

  async updateTimeEntry(
    id: string,
    data: Partial<TimeEntry>
  ): Promise<TimeEntry> {
    return apiClient.put(`${this.baseUrl}/time-entries/${id}`, data);
  }

  async deleteTimeEntry(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/time-entries/${id}`);
  }

  // ============================================================================
  // Expenses
  // ============================================================================

  async getExpenses(filters?: BillingFilters): Promise<Expense[]> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/expenses${params}`);
  }

  async getExpense(id: string): Promise<Expense> {
    return apiClient.get(`${this.baseUrl}/expenses/${id}`);
  }

  async createExpense(data: Partial<Expense>): Promise<Expense> {
    return apiClient.post(`${this.baseUrl}/expenses`, data);
  }

  async updateExpense(id: string, data: Partial<Expense>): Promise<Expense> {
    return apiClient.put(`${this.baseUrl}/expenses/${id}`, data);
  }

  async deleteExpense(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/expenses/${id}`);
  }

  // ============================================================================
  // AR & Collections
  // ============================================================================

  async getARAgingBuckets(filters?: BillingFilters): Promise<ARAgingBucket[]> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/analytics/ar-aging${params}`);
  }

  async getCollectionItems(
    filters?: BillingFilters
  ): Promise<CollectionItem[]> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/collections${params}`);
  }

  async updateCollectionItem(
    id: string,
    data: Partial<CollectionItem>
  ): Promise<CollectionItem> {
    return apiClient.put(`${this.baseUrl}/collections/${id}`, data);
  }

  async getWriteOffRequests(
    filters?: BillingFilters
  ): Promise<WriteOffRequest[]> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/write-offs${params}`);
  }

  async createWriteOffRequest(
    data: Partial<WriteOffRequest>
  ): Promise<WriteOffRequest> {
    return apiClient.post(`${this.baseUrl}/write-offs`, data);
  }

  async approveWriteOff(id: string): Promise<WriteOffRequest> {
    return apiClient.post(`${this.baseUrl}/write-offs/${id}/approve`, {});
  }

  async rejectWriteOff(id: string, reason: string): Promise<WriteOffRequest> {
    return apiClient.post(`${this.baseUrl}/write-offs/${id}/reject`, {
      reason,
    });
  }

  // ============================================================================
  // Reports Export
  // ============================================================================

  async exportReport(
    reportType: string,
    format: "pdf" | "excel" | "csv",
    filters?: BillingFilters
  ): Promise<Blob> {
    const params = this.buildQueryParams({ ...filters, format });
    return apiClient.get(
      `${this.baseUrl}/reports/${reportType}/export${params}`,
      {
        headers: {
          Accept:
            format === "pdf" ? "application/pdf" : "application/octet-stream",
        },
      } as unknown as undefined
    );
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private buildQueryParams(
    filters?: BillingFilters | Record<string, unknown>
  ): string {
    if (!filters) return "";
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }
}

export const billingApiService = new BillingApiService();
