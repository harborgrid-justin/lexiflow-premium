/**
 * Additional Backend API Services
 * Covers Projects, Communications, Time Entries, Invoices, and Expenses
 */

import { apiClient, type PaginatedResponse } from './apiClient';
import { Project, TimeEntry, FirmExpense } from '../types';

// ==================== PROJECTS ====================
export interface CreateProjectDto {
  name: string;
  description?: string;
  caseId?: string;
  status?: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  startDate?: string;
  endDate?: string;
  budget?: number;
  leadAttorney?: string;
  teamMembers?: string[];
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

export interface ProjectFilterDto {
  caseId?: string;
  status?: string;
  leadAttorney?: string;
  page?: number;
  limit?: number;
}

export class ProjectsApiService {
  async getAll(filters?: ProjectFilterDto): Promise<Project[]> {
    const response = await apiClient.get<PaginatedResponse<Project>>('/projects', filters);
    return response.data;
  }

  async getById(id: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${id}`);
  }

  async getByCaseId(caseId: string): Promise<Project[]> {
    const response = await apiClient.get<PaginatedResponse<Project>>('/projects', { caseId });
    return response.data;
  }

  async create(project: CreateProjectDto): Promise<Project> {
    return apiClient.post<Project>('/projects', project);
  }

  async update(id: string, project: UpdateProjectDto): Promise<Project> {
    return apiClient.put<Project>(`/projects/${id}`, project);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  }
}

// ==================== COMMUNICATIONS ====================
export interface Communication {
  id: string;
  type: 'email' | 'sms' | 'letter' | 'notice';
  subject: string;
  body: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  caseId?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'delivered' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  attachments?: { name: string; url: string; size: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunicationDto {
  type: 'email' | 'sms' | 'letter' | 'notice';
  subject: string;
  body: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  caseId?: string;
  scheduledAt?: string;
  attachments?: any[];
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'letter' | 'notice';
  subject: string;
  body: string;
  variables: string[];
  category: string;
}

export class CommunicationsApiService {
  async getAll(filters?: { caseId?: string; type?: string; status?: string }): Promise<Communication[]> {
    const response = await apiClient.get<PaginatedResponse<Communication>>('/communications', filters);
    return response.data;
  }

  async getById(id: string): Promise<Communication> {
    return apiClient.get<Communication>(`/communications/${id}`);
  }

  async create(communication: CreateCommunicationDto): Promise<Communication> {
    return apiClient.post<Communication>('/communications', communication);
  }

  async update(id: string, communication: Partial<CreateCommunicationDto>): Promise<Communication> {
    return apiClient.put<Communication>(`/communications/${id}`, communication);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/communications/${id}`);
  }

  async send(id: string): Promise<Communication> {
    return apiClient.post<Communication>(`/communications/${id}/send`, {});
  }

  async getDeliveryStatus(id: string): Promise<{ status: string; details: any }> {
    return apiClient.get<{ status: string; details: any }>(`/communications/${id}/status`);
  }

  async getScheduledMessages(): Promise<Communication[]> {
    const response = await apiClient.get<PaginatedResponse<Communication>>('/communications/scheduled');
    return response.data;
  }

  async scheduleMessage(id: string, scheduledAt: string): Promise<Communication> {
    return apiClient.post<Communication>(`/communications/${id}/schedule`, { scheduledAt });
  }

  async getTemplates(): Promise<CommunicationTemplate[]> {
    const response = await apiClient.get<PaginatedResponse<CommunicationTemplate>>('/communications/templates');
    return response.data;
  }

  async renderTemplate(templateId: string, variables: Record<string, any>): Promise<{ subject: string; body: string }> {
    return apiClient.post<{ subject: string; body: string }>(`/communications/templates/${templateId}/render`, { variables });
  }
}

// ==================== TIME ENTRIES ====================
export interface TimeEntryDto {
  caseId: string;
  userId: string;
  date: string;
  description: string;
  duration: number; // in minutes
  rate?: number;
  billable?: boolean;
  taskCode?: string;
  activityType?: string;
}

export interface TimeEntryTotals {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  totalAmount: number;
}

export class TimeEntriesApiService {
  async getAll(filters?: { caseId?: string; userId?: string; startDate?: string; endDate?: string }): Promise<TimeEntry[]> {
    const response = await apiClient.get<PaginatedResponse<TimeEntry>>('/billing/time-entries', filters);
    return response.data;
  }

  async getByCaseId(caseId: string): Promise<TimeEntry[]> {
    const response = await apiClient.get<PaginatedResponse<TimeEntry>>('/billing/time-entries', { caseId });
    return response.data;
  }

  async getByUserId(userId: string): Promise<TimeEntry[]> {
    const response = await apiClient.get<PaginatedResponse<TimeEntry>>('/billing/time-entries', { userId });
    return response.data;
  }

  async getUnbilled(caseId: string): Promise<TimeEntry[]> {
    const response = await apiClient.get<PaginatedResponse<TimeEntry>>(`/billing/time-entries/case/${caseId}/unbilled`);
    return response.data;
  }

  async getTotals(caseId: string): Promise<TimeEntryTotals> {
    return apiClient.get<TimeEntryTotals>(`/billing/time-entries/case/${caseId}/totals`);
  }

  async getById(id: string): Promise<TimeEntry> {
    return apiClient.get<TimeEntry>(`/billing/time-entries/${id}`);
  }

  async create(entry: TimeEntryDto): Promise<TimeEntry> {
    return apiClient.post<TimeEntry>('/billing/time-entries', entry);
  }

  async createBulk(entries: TimeEntryDto[]): Promise<TimeEntry[]> {
    return apiClient.post<TimeEntry[]>('/billing/time-entries/bulk', { entries });
  }

  async update(id: string, entry: Partial<TimeEntryDto>): Promise<TimeEntry> {
    return apiClient.put<TimeEntry>(`/billing/time-entries/${id}`, entry);
  }

  async approve(id: string): Promise<TimeEntry> {
    return apiClient.put<TimeEntry>(`/billing/time-entries/${id}/approve`, {});
  }

  async bill(id: string, invoiceId: string): Promise<TimeEntry> {
    return apiClient.put<TimeEntry>(`/billing/time-entries/${id}/bill`, { invoiceId });
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/billing/time-entries/${id}`);
  }
}

// ==================== INVOICES ====================
export interface Invoice {
  id: string;
  invoiceNumber: string;
  caseId: string;
  clientId: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  currency: string;
  notes?: string;
  lineItems: InvoiceLineItem[];
  payments: InvoicePayment[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxable: boolean;
}

export interface InvoicePayment {
  id: string;
  amount: number;
  date: string;
  method: string;
  reference?: string;
}

export interface CreateInvoiceDto {
  caseId: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  lineItems: Omit<InvoiceLineItem, 'id'>[];
  notes?: string;
  tax?: number;
}

export class InvoicesApiService {
  async getAll(filters?: { caseId?: string; clientId?: string; status?: string }): Promise<Invoice[]> {
    const response = await apiClient.get<PaginatedResponse<Invoice>>('/billing/invoices', filters);
    return response.data;
  }

  async getOverdue(): Promise<Invoice[]> {
    const response = await apiClient.get<PaginatedResponse<Invoice>>('/billing/invoices/overdue');
    return response.data;
  }

  async getById(id: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`/billing/invoices/${id}`);
  }

  async getPdf(id: string): Promise<Blob> {
    // Note: Adjust apiClient to support blob responses if needed
    return apiClient.get<Blob>(`/billing/invoices/${id}/pdf`);
  }

  async create(invoice: CreateInvoiceDto): Promise<Invoice> {
    return apiClient.post<Invoice>('/billing/invoices', invoice);
  }

  async update(id: string, invoice: Partial<CreateInvoiceDto>): Promise<Invoice> {
    return apiClient.put<Invoice>(`/billing/invoices/${id}`, invoice);
  }

  async send(id: string, recipients?: string[]): Promise<Invoice> {
    return apiClient.post<Invoice>(`/billing/invoices/${id}/send`, { recipients });
  }

  async recordPayment(id: string, payment: Omit<InvoicePayment, 'id'>): Promise<Invoice> {
    return apiClient.post<Invoice>(`/billing/invoices/${id}/record-payment`, payment);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/billing/invoices/${id}`);
  }
}

// ==================== EXPENSES ====================
export interface ExpenseDto {
  caseId: string;
  userId: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  currency?: string;
  billable?: boolean;
  receipt?: {
    filename: string;
    url: string;
    size: number;
  };
  vendor?: string;
  paymentMethod?: string;
}

export class ExpensesApiService {
  async getAll(filters?: { caseId?: string; userId?: string; startDate?: string; endDate?: string }): Promise<FirmExpense[]> {
    const response = await apiClient.get<PaginatedResponse<FirmExpense>>('/billing/expenses', filters);
    return response.data;
  }

  async getByCaseId(caseId: string): Promise<FirmExpense[]> {
    const response = await apiClient.get<PaginatedResponse<FirmExpense>>('/billing/expenses', { caseId });
    return response.data;
  }

  async getUnbilled(caseId: string): Promise<FirmExpense[]> {
    const response = await apiClient.get<PaginatedResponse<FirmExpense>>(`/billing/expenses/unbilled/${caseId}`);
    return response.data;
  }

  async getById(id: string): Promise<FirmExpense> {
    return apiClient.get<FirmExpense>(`/billing/expenses/${id}`);
  }

  async create(expense: ExpenseDto): Promise<FirmExpense> {
    return apiClient.post<FirmExpense>('/billing/expenses', expense);
  }

  async update(id: string, expense: Partial<ExpenseDto>): Promise<FirmExpense> {
    return apiClient.put<FirmExpense>(`/billing/expenses/${id}`, expense);
  }

  async approve(id: string): Promise<FirmExpense> {
    return apiClient.put<FirmExpense>(`/billing/expenses/${id}/approve`, {});
  }

  async bill(id: string, invoiceId: string): Promise<FirmExpense> {
    return apiClient.put<FirmExpense>(`/billing/expenses/${id}/bill`, { invoiceId });
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/billing/expenses/${id}`);
  }

  async uploadReceipt(id: string, file: File): Promise<{ url: string; filename: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ url: string; filename: string; size: number }>(`/billing/expenses/${id}/receipt`, formData);
  }
}

// ==================== EXPORT ====================
export const additionalApiServices = {
  projects: new ProjectsApiService(),
  communications: new CommunicationsApiService(),
  timeEntries: new TimeEntriesApiService(),
  invoices: new InvoicesApiService(),
  expenses: new ExpensesApiService(),
};
