
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
  };
}

export interface PleadingDocument extends BaseEntity {
  caseId: CaseId;
  title: string;
  status: 'Draft' | 'Review' | 'Final' | 'Filed';
  sections: PleadingSection[];
  version: number;
  lastAutoSaved?: string;
}

export interface PleadingTemplate {
  id: string;
  name: string;
  category: 'Motion' | 'Complaint' | 'Answer' | 'Discovery';
  defaultSections: PleadingSection[];
  jurisdiction?: string;
}
