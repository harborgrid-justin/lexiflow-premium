
import { BaseEntity, CaseId, UserId, EvidenceId } from './models';

export type PleadingSectionType = 
  | 'Caption' 
  | 'Heading' 
  | 'Paragraph' 
  | 'List' 
  | 'BlockQuote' 
  | 'Signature' 
  | 'Certificate';

export interface PleadingSection {
  id: string;
  type: PleadingSectionType;
  content: string;
  order: number;
  meta?: {
      alignment?: 'left' | 'center' | 'right' | 'justify';
      isBold?: boolean;
  };
  // Logic Linking
  linkedEvidenceIds?: string[];
  linkedCitationIds?: string[];
  linkedFactIds?: string[];
  // Compliance
  complianceIssues?: string[];
  metadata?: Record<string, any>;
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
    key: string;
    label: string;
    value: string;
    source: 'Case' | 'System' | 'Manual' | 'Client';
}

export interface LogicLink {
    id: string;
    fromSectionId: string;
    toEntityId: string;
    type: 'Evidence' | 'Citation' | 'Fact';
}

export interface PleadingDocument extends BaseEntity {
  caseId: CaseId;
  title: string;
  status: 'Draft' | 'Review' | 'Final' | 'Filed';
  sections: PleadingSection[];
  comments?: PleadingComment[];
  variables?: PleadingVariable[];
  links?: LogicLink[]; 
  jurisdictionRulesId: string; 
  version: number;
  lastAutoSaved?: string;
  createdBy?: UserId;
}

export interface PleadingTemplate {
    id: string;
    name: string;
    category: string;
    defaultSections: Partial<PleadingSection>[];
}

export interface FormattingRule {
    id: string;
    name: string;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    marginTop: string;
    marginBottom: string;
    marginLeft: string;
    marginRight: string;
    showLineNumbers: boolean;
    paperSize: 'Letter' | 'Legal';
    captionStyle: 'Boxed' | 'Underlined' | 'Plain';
}
