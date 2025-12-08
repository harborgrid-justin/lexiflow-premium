
import { BaseEntity, CaseId, UserId } from './models';

export type PleadingSectionType = 
  | 'Caption' 
  | 'Heading' 
  | 'Paragraph' 
  | 'NumberedList' 
  | 'EvidenceRef' 
  | 'CitationRef' 
  | 'Signature' 
  | 'CertificateOfService';

export interface PleadingSection {
  id: string;
  type: PleadingSectionType;
  content: string; // HTML or Text
  meta?: {
    alignment?: 'left' | 'center' | 'right' | 'justify';
    isBold?: boolean;
    linkedId?: string; // ID of Evidence or Citation
    placeholder?: string;
    linkedFactIds?: string[]; // IDs from Case Timeline
  };
}

export interface PleadingComment {
  id: string;
  sectionId: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: string;
  resolved: boolean;
}

export interface PleadingVariable {
  id: string;
  key: string; // e.g., "client_name"
  label: string;
  value: string;
  source: 'Case' | 'Client' | 'System' | 'Manual';
}

export interface PleadingDocument extends BaseEntity {
  caseId: CaseId;
  title: string;
  status: 'Draft' | 'Review' | 'Final' | 'Filed';
  sections: PleadingSection[];
  version: number;
  lastAutoSaved?: string;
  comments?: PleadingComment[];
  variables?: PleadingVariable[];
  citations?: string[]; // IDs of linked citations
  jurisdictionRulesId?: string;
}

export interface PleadingTemplate {
  id: string;
  name: string;
  category: 'Motion' | 'Complaint' | 'Answer' | 'Discovery';
  defaultSections: PleadingSection[];
  jurisdiction?: string;
  variables?: PleadingVariable[];
}
