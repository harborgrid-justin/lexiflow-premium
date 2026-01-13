/**
 * Document-related enums
 * Shared between frontend and backend REST API and GraphQL
 */

export enum DocumentStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  FILED = 'filed',
  ARCHIVED = 'archived',
}

export enum DocumentType {
  MOTION = 'Motion',
  BRIEF = 'Brief',
  COMPLAINT = 'Complaint',
  ANSWER = 'Answer',
  DISCOVERY_REQUEST = 'Discovery Request',
  DISCOVERY_RESPONSE = 'Discovery Response',
  EXHIBIT = 'Exhibit',
  CONTRACT = 'Contract',
  LETTER = 'Letter',
  MEMO = 'Memo',
  PLEADING = 'Pleading',
  ORDER = 'Order',
  TRANSCRIPT = 'Transcript',
  CORRESPONDENCE = 'Correspondence',
  AGREEMENT = 'Agreement',
  EVIDENCE = 'Evidence',
}

export enum DocumentAccessLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  PRIVILEGED = 'privileged',
  ATTORNEY_WORK_PRODUCT = 'attorney_work_product',
}

/**
 * OCR processing status
 */
export enum OcrStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}
