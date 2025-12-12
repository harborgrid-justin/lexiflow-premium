/**
 * Document-related API Types
 */

import type { PaginatedResponse, AuditFields, UserReference, ID } from './common';

// Document status
export type DocumentStatus =
  | 'uploading'
  | 'processing'
  | 'active'
  | 'archived'
  | 'deleted'
  | 'error';

// Document confidentiality level
export type ConfidentialityLevel =
  | 'public'
  | 'internal'
  | 'confidential'
  | 'highly_confidential'
  | 'attorney_client_privileged';

// OCR status
export type OcrStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'not_required';

// Document category
export type DocumentCategory =
  | 'pleading'
  | 'motion'
  | 'brief'
  | 'discovery'
  | 'contract'
  | 'correspondence'
  | 'evidence'
  | 'exhibit'
  | 'research'
  | 'administrative'
  | 'other';

// Document item
export interface DocumentItem extends AuditFields {
  id: ID;
  filename: string;
  title: string;
  description?: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  caseId: ID;
  caseName?: string;
  category: DocumentCategory;
  uploadedBy: ID;
  uploadedByName?: string;
  uploadDate: Date;
  tags: string[];
  isPrivileged: boolean;
  confidentialityLevel: ConfidentialityLevel;
  status: DocumentStatus;
  version: number;
  ocrStatus: OcrStatus;
  checksum: string;
  accessCount: number;
  lastAccessedAt?: Date;
}

// Document details
export interface DocumentDetails extends DocumentItem {
  uploadedByUser: UserReference;
  ocrText?: string;
  metadata: Record<string, any>;
  versions: DocumentVersion[];
  accessLog: DocumentAccessLog[];
  shares: DocumentShare[];
  relatedDocuments: ID[];
}

// Document version
export interface DocumentVersion {
  id: ID;
  documentId: ID;
  version: number;
  filename: string;
  fileSize: number;
  url: string;
  uploadedBy: ID;
  uploadedByUser?: UserReference;
  uploadedAt: Date;
  changeDescription?: string;
  checksum: string;
}

// Document access log entry
export interface DocumentAccessLog {
  id: ID;
  documentId: ID;
  userId: ID;
  user?: UserReference;
  action: 'view' | 'download' | 'edit' | 'delete' | 'share';
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Document share
export interface DocumentShare {
  id: ID;
  documentId: ID;
  sharedWith: string;
  sharedBy: ID;
  sharedByUser?: UserReference;
  shareToken: string;
  expiresAt?: Date;
  canDownload: boolean;
  canEdit: boolean;
  accessCount: number;
  lastAccessedAt?: Date;
  createdAt: Date;
}

// Upload document request
export interface UploadDocumentRequest {
  file: File;
  caseId: ID;
  title?: string;
  description?: string;
  category: DocumentCategory;
  tags?: string[];
  isPrivileged?: boolean;
  confidentialityLevel?: ConfidentialityLevel;
  metadata?: Record<string, any>;
}

// Update document request
export interface UpdateDocumentRequest {
  title?: string;
  description?: string;
  category?: DocumentCategory;
  tags?: string[];
  isPrivileged?: boolean;
  confidentialityLevel?: ConfidentialityLevel;
  metadata?: Record<string, any>;
}

// Document filters
export interface DocumentFilters {
  caseId?: ID;
  category?: DocumentCategory | DocumentCategory[];
  status?: DocumentStatus | DocumentStatus[];
  confidentialityLevel?: ConfidentialityLevel | ConfidentialityLevel[];
  uploadedBy?: ID;
  search?: string;
  tags?: string[];
  isPrivileged?: boolean;
  uploadDateFrom?: string;
  uploadDateTo?: string;
  fileType?: string | string[];
}

// Document list response
export interface DocumentListResponse extends PaginatedResponse<DocumentItem> {}

// Document statistics
export interface DocumentStatistics {
  total: number;
  totalSize: number;
  byFileType: Array<{ fileType: string; count: number; size: number }>;
  byCategory: Array<{ category: DocumentCategory; count: number }>;
  byStatus: Array<{ status: DocumentStatus; count: number }>;
  privilegedCount: number;
  ocrProcessed: number;
  ocrPending: number;
  averageFileSize: number;
}

// Tag with count
export interface DocumentTag {
  tag: string;
  count: number;
}

// Share document request
export interface ShareDocumentRequest {
  sharedWith: string;
  expiresAt?: Date;
  canDownload?: boolean;
  canEdit?: boolean;
  message?: string;
}

// Bulk upload response
export interface BulkUploadResponse {
  successful: number;
  failed: number;
  total: number;
  documents: DocumentItem[];
  errors: Array<{
    filename: string;
    error: string;
  }>;
}
