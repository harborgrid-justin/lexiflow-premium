/**
 * Document Management Types
 */

export interface DocumentNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size?: number;
  modifiedAt: Date;
  children?: DocumentNode[];
  path: string;
  parentId?: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  versionTag?: string;
  contentHash: string;
  content?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  changes?: {
    added?: string[];
    removed?: string[];
    modified?: string[];
    summary?: string;
    linesAdded?: number;
    linesRemoved?: number;
    linesModified?: number;
  };
  metadata?: Record<string, unknown>;
  authorId: string;
  author?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  commitMessage?: string;
  versionType: 'major' | 'minor' | 'patch' | 'auto';
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentClassification {
  id: string;
  documentId: string;
  category: string;
  confidence: number;
  alternativeCategories?: Array<{
    category: string;
    confidence: number;
  }>;
  tags?: string[];
  legalConcepts?: string[];
  jurisdictions?: string[];
  parties?: {
    plaintiffs?: string[];
    defendants?: string[];
    thirdParties?: string[];
  };
  classifiedAt: Date;
}

export interface RetentionPolicy {
  id: string;
  name: string;
  description?: string;
  retentionDays: number;
  action: 'delete' | 'archive' | 'review' | 'notify' | 'transfer';
  appliesTo: string[];
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  isLegalHold: boolean;
  legalHoldReason?: string;
  effectiveDate: Date;
  expirationDate?: Date;
  documentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  content: string;
  variables: TemplateVariable[];
  jurisdiction?: string[];
  practiceAreas?: string[];
  status: 'draft' | 'active' | 'archived' | 'deprecated';
  templateVersion: string;
  outputFormat: 'docx' | 'pdf' | 'html' | 'markdown';
  formattingOptions?: {
    fontSize?: number;
    fontFamily?: string;
    lineSpacing?: number;
    margins?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    pageSize?: 'letter' | 'legal' | 'a4';
    orientation?: 'portrait' | 'landscape';
  };
  header?: string;
  footer?: string;
  tags?: string[];
  usageCount: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'address' | 'party' | 'currency';
  required: boolean;
  defaultValue?: unknown;
  placeholder?: string;
  description?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: string[];
  };
  conditional?: {
    dependsOn: string;
    showWhen: unknown;
  };
}

export interface DiffOperation {
  type: 'insert' | 'delete' | 'equal' | 'replace';
  value: string;
  lineNumber?: number;
  position?: {
    start: number;
    end: number;
  };
}

export interface ComparisonResult {
  version1: {
    id: string;
    versionNumber: number;
    createdAt: Date;
  };
  version2: {
    id: string;
    versionNumber: number;
    createdAt: Date;
  };
  diff: DiffOperation[];
  statistics: {
    additions: number;
    deletions: number;
    modifications: number;
    unchanged: number;
    totalLines1: number;
    totalLines2: number;
    similarity: number;
  };
  metadata?: {
    comparedAt: Date;
    algorithm: string;
  };
}
