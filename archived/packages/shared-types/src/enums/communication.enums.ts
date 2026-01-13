/**
 * Communication-related enums
 * Shared between frontend and backend
 */

export enum CommunicationType {
  LETTER = 'Letter',
  EMAIL = 'Email',
  FAX = 'Fax',
  NOTICE = 'Notice',
  MEMO = 'Memo',
}

export enum CommunicationDirection {
  INBOUND = 'Inbound',
  OUTBOUND = 'Outbound',
}

export enum CommunicationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  PENDING = 'pending',
  READ = 'read',
  ARCHIVED = 'archived',
}
