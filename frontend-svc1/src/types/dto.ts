/**
 * Data Transfer Object (DTO) Types
 * Request/response DTOs for API operations
 */

import type { UserRole } from './enums';

// User DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  title?: string;
  phone?: string;
  extension?: string;
  mobilePhone?: string;
  office?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  department?: string;
  title?: string;
  phone?: string;
  extension?: string;
  mobilePhone?: string;
  office?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Party DTOs
export type PartyTypeBackend = 
  | 'Plaintiff' 
  | 'Defendant' 
  | 'Petitioner' 
  | 'Respondent' 
  | 'Appellant' 
  | 'Appellee' 
  | 'Third Party' 
  | 'Witness' 
  | 'Expert Witness' 
  | 'Other'
  | 'individual'
  | 'corporation'
  | 'government'
  | 'organization';

export type PartyRoleBackend = 
  | 'Primary' 
  | 'Co-Party' 
  | 'Interested Party' 
  | 'Guardian' 
  | 'Representative'
  | 'plaintiff'
  | 'defendant'
  | 'petitioner'
  | 'respondent'
  | 'appellant'
  | 'appellee'
  | 'third_party'
  | 'intervenor'
  | 'witness'
  | 'expert';

export interface CreatePartyDto {
  caseId: string;
  name: string;
  type: PartyTypeBackend;
  role?: PartyRoleBackend;
  organization?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  counsel?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdatePartyDto extends Partial<CreatePartyDto> {}

// Billing DTOs
export interface CreateTimeEntryDto {
  caseId: string;
  userId?: string;
  date: string;
  hours: number;
  rate?: number;
  description: string;
  billable?: boolean;
  taskCode?: string;
  activityCode?: string;
  status?: 'draft' | 'submitted' | 'approved';
}

export interface UpdateTimeEntryDto extends Partial<CreateTimeEntryDto> {}

export interface BulkTimeEntryDto {
  entries: CreateTimeEntryDto[];
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors?: string[];
}

export interface CreateExpenseDto {
  caseId: string;
  userId?: string;
  date: string;
  amount: number;
  category: string;
  vendor?: string;
  description: string;
  receiptUrl?: string;
  billable?: boolean;
  reimbursable?: boolean;
  status?: 'draft' | 'submitted' | 'approved';
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {}

export interface ExpenseTotals {
  total: number;
  billable: number;
  reimbursable: number;
  byCategory: Record<string, number>;
}

export interface TimeEntryTotals {
  totalHours: number;
  billableHours: number;
  totalAmount: number;
  billableAmount: number;
  byUser: Record<string, number>;
}

export interface CreateInvoiceDto {
  clientId: string;
  caseId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxable?: boolean;
}

export interface InvoicePayment {
  paymentDate: string;
  amount: number;
  method: 'check' | 'wire' | 'credit_card' | 'ach' | 'other';
  reference?: string;
  notes?: string;
}
