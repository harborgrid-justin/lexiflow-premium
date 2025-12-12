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
}

export enum DocumentStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  FILED = 'filed',
  ARCHIVED = 'archived',
}

export interface DocumentMetadata {
  author?: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}
