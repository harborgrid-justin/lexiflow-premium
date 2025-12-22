import { BaseEntity, CaseId, DocumentId, UserId } from './base.entity';
import { DocumentStatus, DocumentType, DocumentAccessLevel } from '../enums/document.enums';
import { CustomFields } from '../common/json-value.types';

/**
 * Document entity interface
 * Shared between frontend and backend
 */
export interface Document extends BaseEntity {
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
  ocrProcessedAt?: string; // ISO timestamp
  accessLevel?: DocumentAccessLevel;
}

/**
 * Minimal document information for lists
 */
export interface DocumentSummary {
  id: DocumentId;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Document version information
 */
export interface DocumentVersion {
  id: string;
  documentId: DocumentId;
  versionNumber: number;
  filename: string;
  fileSize: number;
  checksum: string;
  createdBy: UserId;
  createdAt: string;
  comment?: string;
}
