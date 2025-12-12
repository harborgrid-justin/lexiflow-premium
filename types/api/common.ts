/**
 * Common API Types
 */

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore?: boolean;
  totalPages?: number;
}

// API Success response
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

// API Error response
export interface ErrorResponse {
  success: false;
  error: {
    name: string;
    message: string;
    statusCode: number;
    timestamp: Date;
    details?: any;
    userMessage: string;
  };
}

// Status types
export type Status = 'active' | 'inactive' | 'pending' | 'archived' | 'deleted';

// Date range filter
export interface DateRangeFilter {
  from?: string;
  to?: string;
}

// Generic ID type
export type ID = string;

// File upload response
export interface FileUploadResponse {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

// Bulk operation response
export interface BulkOperationResponse {
  success: number;
  failed: number;
  total: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

// Search filters
export interface SearchFilters {
  query?: string;
  status?: string | string[];
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  [key: string]: any;
}

// Audit fields (common to many entities)
export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

// User reference (lightweight)
export interface UserReference {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
}

// Case reference (lightweight)
export interface CaseReference {
  id: string;
  caseNumber: string;
  title: string;
  status?: string;
}

// Address type
export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Phone number type
export interface PhoneNumber {
  type: 'mobile' | 'work' | 'home' | 'fax';
  number: string;
  isPrimary?: boolean;
}

// Email type
export interface Email {
  type: 'work' | 'personal';
  email: string;
  isPrimary?: boolean;
}

// Attachment type
export interface Attachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

// Tag type
export interface Tag {
  id: string;
  name: string;
  color?: string;
  category?: string;
}

// Export format
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'xml';

// Sort direction
export type SortDirection = 'asc' | 'desc';

// Priority levels
export type Priority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

// Notification type
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Permission type
export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  granted: boolean;
}

// Metadata type (flexible key-value pairs)
export type Metadata = Record<string, any>;

// Time period type
export type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

// Currency type
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

// Money amount with currency
export interface MoneyAmount {
  amount: number;
  currency: Currency;
  formatted?: string;
}

// Validation error
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Generic filter type
export interface Filter<T = any> {
  field: keyof T;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'between';
  value: any;
}

// Generic sort type
export interface Sort<T = any> {
  field: keyof T;
  direction: SortDirection;
}
