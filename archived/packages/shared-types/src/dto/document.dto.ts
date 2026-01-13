/**
 * Document-related DTOs
 * Shared between frontend and backend
 */

import { CaseId, DocumentId, UserId } from '../entities/base.entity';
import { DocumentStatus, DocumentType, DocumentAccessLevel } from '../enums/document.enums';
import { CustomFields } from '../common/json-value.types';

/**
 * Create document request DTO
 */
export interface CreateDocumentDto {
  title: string;
  description?: string;
  type: DocumentType;
  caseId: string;
  creatorId: string;
  status?: DocumentStatus;
  filename?: string;
  filePath?: string;
  mimeType?: string;
  fileSize?: number;
  checksum?: string;
  currentVersion?: number;
  author?: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  tags?: string[];
  customFields?: CustomFields;
  fullTextContent?: string;
  ocrProcessed?: boolean;
  accessLevel?: DocumentAccessLevel;
}

/**
 * Update document request DTO
 */
export interface UpdateDocumentDto {
  title?: string;
  description?: string;
  type?: DocumentType;
  status?: DocumentStatus;
  filename?: string;
  author?: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  tags?: string[];
  customFields?: CustomFields;
  fullTextContent?: string;
  ocrProcessed?: boolean;
  ocrProcessedAt?: string;
  accessLevel?: DocumentAccessLevel;
}

/**
 * Document filter parameters
 */
export interface DocumentFilterParams {
  search?: string;
  caseId?: CaseId;
  type?: DocumentType | DocumentType[];
  status?: DocumentStatus | DocumentStatus[];
  creatorId?: UserId;
  accessLevel?: DocumentAccessLevel;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Document response DTO
 */
export interface DocumentResponseDto {
  id: DocumentId;
  title: string;
  description?: string;
  type: DocumentType;
  caseId: CaseId;
  creatorId: UserId;
  status: DocumentStatus;
  filename?: string;
  filePath?: string;
  mimeType?: string;
  fileSize?: number;
  checksum?: string;
  currentVersion?: number;
  author?: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  tags?: string[];
  customFields?: CustomFields;
  fullTextContent?: string;
  ocrProcessed?: boolean;
  ocrProcessedAt?: string;
  accessLevel?: DocumentAccessLevel;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * File upload data type - compatible with both browser and Node.js
 */
export type FileUploadData = Blob | ArrayBuffer | Uint8Array;

/**
 * Document upload request DTO
 */
export interface DocumentUploadDto {
  title: string;
  description?: string;
  type: DocumentType;
  caseId: string;
  file: FileUploadData;
  tags?: string[];
  accessLevel?: DocumentAccessLevel;
}

/**
 * Document version create DTO
 */
export interface CreateDocumentVersionDto {
  documentId: string;
  versionNumber: number;
  filename: string;
  fileSize: number;
  checksum: string;
  createdBy: string;
  comment?: string;
}

/**
 * Bulk document operation DTO
 */
export interface BulkDocumentOperationDto {
  documentIds: DocumentId[];
  operation: 'delete' | 'updateStatus' | 'updateAccessLevel' | 'addTags';
  params?: {
    status?: DocumentStatus;
    accessLevel?: DocumentAccessLevel;
    tags?: string[];
  };
}
