// Re-export types from main types module
export type {
  CreateTrustAccountDto,
  CreateTrustTransactionDto,
  DepositDto,
  FinancialPerformanceData,
  TimeEntry,
  TrustAccount,
  TrustAccountStatus,
  TrustTransactionEntity,
  UpdateTrustAccountDto,
  WithdrawalDto,
} from "@/types";

export interface TimeEntryFilters {
  caseId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface InvoiceFilters {
  caseId?: string;
  clientId?: string;
  status?: string;
}

export interface TrustAccountFilters {
  clientId?: string;
  status?: string;
}

export interface TrustTransactionFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface TimeEntryTotals {
  total: number;
  billable: number;
  unbilled: number;
}

export interface TrustAccountBalance {
  balance: number;
  currency: string;
}

export interface OverviewStats {
  realization: number;
  totalBilled: number;
  month: string;
}
