/**
 * Extended Backend API Services
 * Comprehensive coverage for all backend endpoints
 * This file adds missing services identified in the gap analysis
 */

import { apiClient, type PaginatedResponse } from './apiClient';

// ==================== TRUST ACCOUNTS ====================
export interface TrustAccountTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'interest';
  amount: number;
  balance: number;
  description: string;
  reference?: string;
  createdAt: string;
  createdBy: string;
}

export interface TrustAccount {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  status: 'Active' | 'Inactive' | 'Frozen';
  balance: number;
  currency: string;
  caseId?: string;
  clientId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class TrustAccountsApiService {
  async getAll(filters?: { status?: string; caseId?: string }): Promise<TrustAccount[]> {
    const response = await apiClient.get<PaginatedResponse<TrustAccount>>('/billing/trust-accounts', filters);
    return response.data;
  }

  async getById(id: string): Promise<TrustAccount> {
    return apiClient.get<TrustAccount>(`/billing/trust-accounts/${id}`);
  }

  async getBalance(id: string): Promise<{ balance: number; currency: string; lastUpdated: string }> {
    return apiClient.get<{ balance: number; currency: string; lastUpdated: string }>(`/billing/trust-accounts/${id}/balance`);
  }

  async getTransactions(id: string, filters?: { startDate?: string; endDate?: string }): Promise<TrustAccountTransaction[]> {
    const response = await apiClient.get<PaginatedResponse<TrustAccountTransaction>>(`/billing/trust-accounts/${id}/transactions`, filters);
    return response.data;
  }

  async getLowBalanceAccounts(threshold?: number): Promise<TrustAccount[]> {
    const params = threshold ? { threshold } : {};
    const response = await apiClient.get<PaginatedResponse<TrustAccount>>('/billing/trust-accounts/low-balance', params);
    return response.data;
  }

  async create(account: Omit<TrustAccount, 'id' | 'createdAt' | 'updatedAt' | 'balance'>): Promise<TrustAccount> {
    return apiClient.post<TrustAccount>('/billing/trust-accounts', account);
  }

  async update(id: string, account: Partial<TrustAccount>): Promise<TrustAccount> {
    return apiClient.put<TrustAccount>(`/billing/trust-accounts/${id}`, account);
  }

  async deposit(id: string, amount: number, description: string, reference?: string): Promise<TrustAccountTransaction> {
    return apiClient.post<TrustAccountTransaction>(`/billing/trust-accounts/${id}/deposit`, { amount, description, reference });
  }

  async withdraw(id: string, amount: number, description: string, reference?: string): Promise<TrustAccountTransaction> {
    return apiClient.post<TrustAccountTransaction>(`/billing/trust-accounts/${id}/withdraw`, { amount, description, reference });
  }

  async addTransaction(id: string, transaction: Omit<TrustAccountTransaction, 'id' | 'createdAt' | 'balance'>): Promise<TrustAccountTransaction> {
    return apiClient.post<TrustAccountTransaction>(`/billing/trust-accounts/${id}/transaction`, transaction);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/billing/trust-accounts/${id}`);
  }
}

// ==================== BILLING ANALYTICS ====================
export interface WIPStats {
  totalWIP: number;
  billedWIP: number;
  unbilledWIP: number;
  avgDaysOutstanding: number;
  byPracticeArea: { area: string; amount: number }[];
  byAttorney: { attorney: string; amount: number }[];
  trend: { date: string; amount: number }[];
}

export interface RealizationRate {
  standardRate: number;
  billedRate: number;
  collectedRate: number;
  realizationPercentage: number;
  writeOffs: number;
  discounts: number;
  byClient: { client: string; rate: number }[];
  byPracticeArea: { area: string; rate: number }[];
}

export interface OperatingSummary {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    changePercent: number;
  };
  collections: {
    total: number;
    thisMonth: number;
    outstanding: number;
    collectionRate: number;
  };
  expenses: {
    total: number;
    thisMonth: number;
    byCategory: { category: string; amount: number }[];
  };
  profitability: {
    netIncome: number;
    profitMargin: number;
    trend: { date: string; amount: number }[];
  };
}

export interface ARAgingReport {
  total: number;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  days120Plus: number;
  byClient: {
    client: string;
    total: number;
    current: number;
    days30: number;
    days60: number;
    days90: number;
    days120Plus: number;
  }[];
}

export class BillingAnalyticsApiService {
  async getWIPStats(filters?: { startDate?: string; endDate?: string; practiceArea?: string }): Promise<WIPStats> {
    return apiClient.get<WIPStats>('/billing/wip-stats', filters);
  }

  async getRealizationRate(filters?: { startDate?: string; endDate?: string }): Promise<RealizationRate> {
    return apiClient.get<RealizationRate>('/billing/realization', filters);
  }

  async getOperatingSummary(filters?: { startDate?: string; endDate?: string }): Promise<OperatingSummary> {
    return apiClient.get<OperatingSummary>('/billing/operating-summary', filters);
  }

  async getARAgingReport(): Promise<ARAgingReport> {
    return apiClient.get<ARAgingReport>('/billing/ar-aging');
  }
}

// ==================== REPORTS ====================
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'Case' | 'Billing' | 'Discovery' | 'Compliance' | 'Analytics' | 'Custom';
  format: 'PDF' | 'Excel' | 'CSV' | 'HTML';
  parameters: Record<string, any>;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    recipients: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  status: 'Pending' | 'Generating' | 'Completed' | 'Failed';
  format: string;
  parameters: Record<string, any>;
  generatedBy: string;
  generatedAt: string;
  downloadUrl?: string;
  error?: string;
}

export class ReportsApiService {
  async getTemplates(): Promise<ReportTemplate[]> {
    const response = await apiClient.get<PaginatedResponse<ReportTemplate>>('/reports/templates');
    return response.data;
  }

  async getTemplateById(id: string): Promise<ReportTemplate> {
    return apiClient.get<ReportTemplate>(`/reports/templates/${id}`);
  }

  async getTemplatesByType(type: string): Promise<ReportTemplate[]> {
    const response = await apiClient.get<PaginatedResponse<ReportTemplate>>(`/reports/by-type/${type}`);
    return response.data;
  }

  async createTemplate(template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportTemplate> {
    return apiClient.post<ReportTemplate>('/reports/templates', template);
  }

  async generateReport(data: { templateId: string; parameters?: Record<string, any> }): Promise<GeneratedReport> {
    return apiClient.post<GeneratedReport>('/reports/generate', data);
  }

  async generateReportDirect(data: { type: string; format: string; parameters: Record<string, any> }): Promise<GeneratedReport> {
    return apiClient.post<GeneratedReport>('/reports/generateReport', data);
  }

  async listReports(filters?: { status?: string; templateId?: string }): Promise<GeneratedReport[]> {
    const response = await apiClient.get<PaginatedResponse<GeneratedReport>>('/reports/list', filters);
    return response.data;
  }

  async getReportById(id: string): Promise<GeneratedReport> {
    return apiClient.get<GeneratedReport>(`/reports/${id}`);
  }

  async getReportStatus(id: string): Promise<{ status: string; progress?: number; error?: string }> {
    return apiClient.get<{ status: string; progress?: number; error?: string }>(`/reports/${id}/status`);
  }

  async exportReport(id: string, format: string): Promise<Blob> {
    const response = await fetch(`${apiClient.getBaseUrl()}/reports/${id}/export?format=${format}`, {
      headers: apiClient['getHeaders'](),
    });
    return response.blob();
  }

  async downloadReport(id: string): Promise<Blob> {
    const response = await fetch(`${apiClient.getBaseUrl()}/reports/${id}/download`, {
      headers: apiClient['getHeaders'](),
    });
    return response.blob();
  }

  async getDownloadUrl(id: string): Promise<{ url: string; expiresAt: string }> {
    return apiClient.get<{ url: string; expiresAt: string }>(`/reports/${id}/getDownloadUrl`);
  }

  async deleteReport(id: string): Promise<void> {
    await apiClient.delete(`/reports/${id}`);
  }

  async scheduleReport(data: { templateId: string; frequency: string; time: string; recipients: string[] }): Promise<{ id: string; message: string }> {
    return apiClient.post<{ id: string; message: string }>('/reports/schedule', data);
  }

  async getScheduledReports(userId: string): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<any>>(`/reports/scheduled/${userId}`);
    return response.data;
  }

  async deleteScheduledReport(id: string): Promise<void> {
    await apiClient.delete(`/reports/scheduled/${id}`);
  }
}

// ==================== PROCESSING JOBS ====================
export interface ProcessingJob {
  id: string;
  type: 'OCR' | 'DocumentUpload' | 'BulkImport' | 'Export' | 'DataMigration';
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled';
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: string;
}

export interface JobStatistics {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
  avgProcessingTime: number;
  successRate: number;
}

export class ProcessingJobsApiService {
  async getAll(filters?: { status?: string; type?: string; page?: number; limit?: number }): Promise<ProcessingJob[]> {
    const response = await apiClient.get<PaginatedResponse<ProcessingJob>>('/processing-jobs', filters);
    return response.data;
  }

  async getStatistics(): Promise<JobStatistics> {
    return apiClient.get<JobStatistics>('/processing-jobs/statistics');
  }

  async getById(id: string): Promise<ProcessingJob> {
    return apiClient.get<ProcessingJob>(`/processing-jobs/${id}`);
  }

  async getStatus(id: string): Promise<{ status: string; progress: number; message?: string }> {
    return apiClient.get<{ status: string; progress: number; message?: string }>(`/processing-jobs/${id}/status`);
  }

  async cancel(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/processing-jobs/${id}/cancel`, {});
  }
}

// ==================== DASHBOARD ====================
export interface DashboardData {
  myCases: {
    total: number;
    active: number;
    pending: number;
    closed: number;
    recent: any[];
  };
  upcomingDeadlines: {
    total: number;
    today: number;
    thisWeek: number;
    upcoming: any[];
  };
  pendingTasks: {
    total: number;
    overdue: number;
    dueToday: number;
    tasks: any[];
  };
  billingSummary: {
    unbilledTime: number;
    unbilledExpenses: number;
    outstandingInvoices: number;
    collectionRate: number;
  };
}

export class DashboardApiService {
  async getDashboard(filters?: { userId?: string; startDate?: string; endDate?: string }): Promise<DashboardData> {
    return apiClient.get<DashboardData>('/dashboard', filters);
  }

  async getMyCases(userId?: string): Promise<any> {
    return apiClient.get<any>('/dashboard/my-cases', userId ? { userId } : {});
  }

  async getDeadlines(userId?: string): Promise<any> {
    return apiClient.get<any>('/dashboard/deadlines', userId ? { userId } : {});
  }

  async getTasks(userId?: string): Promise<any> {
    return apiClient.get<any>('/dashboard/tasks', userId ? { userId } : {});
  }

  async getBillingSummary(userId?: string): Promise<any> {
    return apiClient.get<any>('/dashboard/billing-summary', userId ? { userId } : {});
  }
}

// ==================== CASE MANAGEMENT EXTENSIONS ====================

// Case Phases
export interface CasePhase {
  id: string;
  caseId: string;
  name: string;
  type: 'Pleadings' | 'Discovery' | 'Motions' | 'Trial' | 'Appeal' | 'Settlement';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  startDate?: string;
  endDate?: string;
  estimatedDuration?: number;
  progress: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class CasePhasesApiService {
  async getByCaseId(caseId: string): Promise<CasePhase[]> {
    const response = await apiClient.get<PaginatedResponse<CasePhase>>(`/cases/${caseId}/phases`);
    return response.data;
  }

  async getById(id: string): Promise<CasePhase> {
    return apiClient.get<CasePhase>(`/case-phases/${id}`);
  }

  async create(caseId: string, phase: Omit<CasePhase, 'id' | 'createdAt' | 'updatedAt'>): Promise<CasePhase> {
    return apiClient.post<CasePhase>(`/cases/${caseId}/phases`, phase);
  }

  async update(id: string, phase: Partial<CasePhase>): Promise<CasePhase> {
    return apiClient.put<CasePhase>(`/case-phases/${id}`, phase);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/case-phases/${id}`);
  }
}

// Case Teams
export interface CaseTeamMember {
  id: string;
  caseId: string;
  userId: string;
  role: 'Lead Attorney' | 'Associate' | 'Paralegal' | 'Legal Assistant' | 'Expert' | 'Consultant';
  permissions: string[];
  hourlyRate?: number;
  joinedAt: string;
  leftAt?: string;
}

export class CaseTeamsApiService {
  async getByCaseId(caseId: string): Promise<CaseTeamMember[]> {
    const response = await apiClient.get<PaginatedResponse<CaseTeamMember>>(`/cases/${caseId}/team`);
    return response.data;
  }

  async getById(id: string): Promise<CaseTeamMember> {
    return apiClient.get<CaseTeamMember>(`/case-teams/${id}`);
  }

  async addMember(caseId: string, member: Omit<CaseTeamMember, 'id' | 'joinedAt'>): Promise<CaseTeamMember> {
    return apiClient.post<CaseTeamMember>(`/cases/${caseId}/team`, member);
  }

  async updateMember(id: string, member: Partial<CaseTeamMember>): Promise<CaseTeamMember> {
    return apiClient.put<CaseTeamMember>(`/case-teams/${id}`, member);
  }

  async removeMember(id: string): Promise<void> {
    await apiClient.delete(`/case-teams/${id}`);
  }
}

// Motions
export interface Motion {
  id: string;
  caseId: string;
  title: string;
  type: 'Motion to Dismiss' | 'Motion for Summary Judgment' | 'Motion in Limine' | 'Motion to Compel' | 'Other';
  status: 'Draft' | 'Filed' | 'Pending' | 'Granted' | 'Denied' | 'Withdrawn';
  filedDate?: string;
  hearingDate?: string;
  decision?: string;
  decisionDate?: string;
  documentIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class MotionsApiService {
  async getAll(filters?: { caseId?: string; status?: string; type?: string }): Promise<Motion[]> {
    const response = await apiClient.get<PaginatedResponse<Motion>>('/motions', filters);
    return response.data;
  }

  async getByCaseId(caseId: string): Promise<Motion[]> {
    const response = await apiClient.get<PaginatedResponse<Motion>>(`/cases/${caseId}/motions`);
    return response.data;
  }

  async getById(id: string): Promise<Motion> {
    return apiClient.get<Motion>(`/motions/${id}`);
  }

  async create(caseId: string, motion: Omit<Motion, 'id' | 'createdAt' | 'updatedAt'>): Promise<Motion> {
    return apiClient.post<Motion>(`/cases/${caseId}/motions`, motion);
  }

  async update(id: string, motion: Partial<Motion>): Promise<Motion> {
    return apiClient.put<Motion>(`/motions/${id}`, motion);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/motions/${id}`);
  }
}

// Parties
export interface Party {
  id: string;
  caseId: string;
  name: string;
  type: 'Plaintiff' | 'Defendant' | 'Third Party' | 'Intervenor' | 'Witness';
  role: string;
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
  attorney?: {
    name: string;
    firm: string;
    email?: string;
    phone?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class PartiesApiService {
  async getByCaseId(caseId: string): Promise<Party[]> {
    const response = await apiClient.get<PaginatedResponse<Party>>(`/cases/${caseId}/parties`);
    return response.data;
  }

  async getById(id: string): Promise<Party> {
    return apiClient.get<Party>(`/parties/${id}`);
  }

  async create(caseId: string, party: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>): Promise<Party> {
    return apiClient.post<Party>(`/cases/${caseId}/parties`, party);
  }

  async update(id: string, party: Partial<Party>): Promise<Party> {
    return apiClient.put<Party>(`/parties/${id}`, party);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/parties/${id}`);
  }
}

// Pleadings
export interface Pleading {
  id: string;
  caseId: string;
  title: string;
  type: 'Complaint' | 'Answer' | 'Reply' | 'Motion' | 'Brief' | 'Order' | 'Other';
  status: 'Draft' | 'Filed' | 'Served' | 'Amended';
  filedDate?: string;
  servedDate?: string;
  documentId?: string;
  partyId?: string;
  docketNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class PleadingsApiService {
  async getAll(filters?: { caseId?: string; status?: string; type?: string }): Promise<Pleading[]> {
    const response = await apiClient.get<PaginatedResponse<Pleading>>('/pleadings', filters);
    return response.data;
  }

  async getUpcomingHearings(): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<any>>('/pleadings/upcoming-hearings');
    return response.data;
  }

  async getById(id: string): Promise<Pleading> {
    return apiClient.get<Pleading>(`/pleadings/${id}`);
  }

  async create(pleading: Omit<Pleading, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pleading> {
    return apiClient.post<Pleading>('/pleadings', pleading);
  }

  async update(id: string, pleading: Partial<Pleading>): Promise<Pleading> {
    return apiClient.put<Pleading>(`/pleadings/${id}`, pleading);
  }

  async file(id: string): Promise<Pleading> {
    return apiClient.post<Pleading>(`/pleadings/${id}/file`, {});
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/pleadings/${id}`);
  }

  async getTemplates(): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<any>>('/pleadings/templates');
    return response.data;
  }

  async getByCaseId(caseId: string): Promise<Pleading[]> {
    return this.getAll({ caseId });
  }

  async createFromTemplate(templateId: string, caseId: string, title: string, userId: string): Promise<Pleading> {
    return apiClient.post<Pleading>('/pleadings/from-template', {
      templateId,
      caseId,
      title,
      userId
    });
  }
}

// Clauses
export interface Clause {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  jurisdiction?: string;
  practiceArea?: string;
  usage: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export class ClausesApiService {
  async getAll(filters?: { category?: string; tags?: string[]; search?: string }): Promise<Clause[]> {
    const response = await apiClient.get<PaginatedResponse<Clause>>('/clauses', filters);
    return response.data;
  }

  async getById(id: string): Promise<Clause> {
    return apiClient.get<Clause>(`/clauses/${id}`);
  }

  async create(clause: Omit<Clause, 'id' | 'createdAt' | 'updatedAt' | 'usage'>): Promise<Clause> {
    return apiClient.post<Clause>('/clauses', clause);
  }

  async update(id: string, clause: Partial<Clause>): Promise<Clause> {
    return apiClient.put<Clause>(`/clauses/${id}`, clause);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/clauses/${id}`);
  }
}

// ==================== EXPORT INSTANCES ====================
export const extendedApiServices = {
  trustAccounts: new TrustAccountsApiService(),
  billingAnalytics: new BillingAnalyticsApiService(),
  reports: new ReportsApiService(),
  processingJobs: new ProcessingJobsApiService(),
  dashboard: new DashboardApiService(),
  casePhases: new CasePhasesApiService(),
  caseTeams: new CaseTeamsApiService(),
  motions: new MotionsApiService(),
  parties: new PartiesApiService(),
  pleadings: new PleadingsApiService(),
  clauses: new ClausesApiService(),
};
