import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ARAgingReport {
  reportDate: string;
  totalAR: number;
  totalInvoices: number;
  buckets: Array<{
    range: string;
    amount: number;
    percentage: number;
    invoiceCount: number;
  }>;
  byClient: Array<{
    clientId: string;
    clientName: string;
    totalOutstanding: number;
    current: number;
    days30: number;
    days60: number;
    days90: number;
    days120Plus: number;
  }>;
  metrics: {
    averageDaysOutstanding: number;
    daysalesOutstanding: number;
    collectionEffectiveness: number;
  };
}

export interface WIPReport {
  reportDate: string;
  totalWIP: number;
  totalTimeWIP: number;
  totalExpenseWIP: number;
  byMatter: Array<{
    matterId: string;
    matterName: string;
    clientName: string;
    totalWIP: number;
    hours: number;
    ageDays: number;
    status: string;
  }>;
  aging: {
    current: number;
    days30: number;
    days60: number;
    days90Plus: number;
  };
}

export interface RealizationReport {
  reportDate: string;
  periodStart: string;
  periodEnd: string;
  overallRealization: {
    billingRealizationRate: number;
    collectionRealizationRate: number;
    overallRealizationRate: number;
    standardValue: number;
    billedValue: number;
    collectedValue: number;
  };
  byTimekeeper: Array<{
    timekeeperName: string;
    billingRealizationRate: number;
    collectionRealizationRate: number;
    standardValue: number;
    billedValue: number;
  }>;
}

export interface ProfitabilityReport {
  reportDate: string;
  overall: {
    totalRevenue: number;
    totalCosts: number;
    totalProfit: number;
    profitMargin: number;
    roi: number;
  };
  byMatter: Array<{
    matterId: string;
    matterName: string;
    clientName: string;
    revenue: number;
    profit: number;
    profitMargin: number;
    status: 'profitable' | 'break_even' | 'unprofitable';
  }>;
  byClient: Array<{
    clientId: string;
    clientName: string;
    revenue: number;
    profit: number;
    profitMargin: number;
    matterCount: number;
  }>;
}

class FinancialReportsService {
  /**
   * Get AR Aging Report
   */
  async getARAging(asOfDate?: string): Promise<ARAgingReport> {
    const response = await axios.get(`${API_BASE}/api/billing/reports/ar-aging`, {
      params: { asOfDate },
    });
    return response.data;
  }

  /**
   * Get WIP Report
   */
  async getWIP(asOfDate?: string): Promise<WIPReport> {
    const response = await axios.get(`${API_BASE}/api/billing/reports/wip`, {
      params: { asOfDate },
    });
    return response.data;
  }

  /**
   * Get Realization Report
   */
  async getRealization(startDate: string, endDate: string): Promise<RealizationReport> {
    const response = await axios.get(`${API_BASE}/api/billing/reports/realization`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  /**
   * Get Profitability Report
   */
  async getProfitability(startDate?: string, endDate?: string): Promise<ProfitabilityReport> {
    const response = await axios.get(`${API_BASE}/api/billing/reports/profitability`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  /**
   * Generate custom report
   */
  async generateReport(reportType: string, period: string): Promise<any> {
    const response = await axios.post(`${API_BASE}/api/billing/reports/generate`, {
      reportType,
      period,
    });
    return response.data;
  }

  /**
   * Export report to PDF
   */
  async exportToPDF(reportType: string, reportData: any): Promise<Blob> {
    const response = await axios.post(
      `${API_BASE}/api/billing/reports/export/pdf`,
      { reportType, reportData },
      { responseType: 'blob' }
    );
    return response.data;
  }

  /**
   * Export report to Excel
   */
  async exportToExcel(reportType: string, reportData: any): Promise<Blob> {
    const response = await axios.post(
      `${API_BASE}/api/billing/reports/export/excel`,
      { reportType, reportData },
      { responseType: 'blob' }
    );
    return response.data;
  }

  /**
   * Get AR trends
   */
  async getARTrends(startDate: string, endDate: string, interval: 'monthly' | 'quarterly' = 'monthly'): Promise<any[]> {
    const response = await axios.get(`${API_BASE}/api/billing/reports/ar-aging/trends`, {
      params: { startDate, endDate, interval },
    });
    return response.data;
  }

  /**
   * Get profitability trends
   */
  async getProfitabilityTrends(startDate: string, endDate: string): Promise<any[]> {
    const response = await axios.get(`${API_BASE}/api/billing/reports/profitability/trends`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  /**
   * Get collection reminders
   */
  async getCollectionReminders(threshold: number = 30): Promise<any[]> {
    const response = await axios.get(`${API_BASE}/api/billing/reports/ar-aging/reminders`, {
      params: { threshold },
    });
    return response.data;
  }

  /**
   * Get stale WIP items
   */
  async getStaleWIP(threshold: number = 180): Promise<any[]> {
    const response = await axios.get(`${API_BASE}/api/billing/reports/wip/stale`, {
      params: { threshold },
    });
    return response.data;
  }

  /**
   * Get low realization matters
   */
  async getLowRealizationMatters(threshold: number = 80): Promise<any[]> {
    const response = await axios.get(`${API_BASE}/api/billing/reports/realization/low`, {
      params: { threshold },
    });
    return response.data;
  }

  /**
   * Get budget summary
   */
  async getBudgetSummary(clientId?: string): Promise<any> {
    const response = await axios.get(`${API_BASE}/api/billing/budget/summary`, {
      params: { clientId },
    });
    return response.data;
  }

  /**
   * Get budget projection
   */
  async getBudgetProjection(budgetId: string): Promise<any> {
    const response = await axios.get(`${API_BASE}/api/billing/budget/${budgetId}/projection`);
    return response.data;
  }

  /**
   * Get write-down analysis
   */
  async getWriteDownAnalysis(startDate: string, endDate: string): Promise<any> {
    const response = await axios.get(`${API_BASE}/api/billing/reports/realization/write-downs`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  /**
   * Get revenue recognition report
   */
  async getRevenueRecognition(startDate: string, endDate: string, clientId?: string): Promise<any> {
    const response = await axios.get(`${API_BASE}/api/billing/revenue/report`, {
      params: { startDate, endDate, clientId },
    });
    return response.data;
  }
}

export const financialReportsService = new FinancialReportsService();
