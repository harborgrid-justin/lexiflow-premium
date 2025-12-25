/**
 * Document-related enums shared across REST API and GraphQL
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
  TEMPLATE = 'Template',
}

export enum DocumentAccessLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  PRIVILEGED = 'privileged',
  ATTORNEY_WORK_PRODUCT = 'attorney_work_product',
}
