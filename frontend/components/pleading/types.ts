import { Case, PleadingDocument, PleadingTemplate, FormattingRule, PleadingSection } from '../../types';

export type ViewMode = 'write' | 'logic' | 'preview';

export interface PleadingBuilderProps {
  onSelectCase?: (c: Case) => void;
  caseId?: string;
}

export interface PleadingDesignerProps {
  pleading: PleadingDocument;
  onBack: () => void;
}

export interface PleadingDraftsProps {
    pleadings: PleadingDocument[];
    onEdit: (doc: PleadingDocument) => void;
}

export interface PleadingTemplatesProps {
    templates: PleadingTemplate[];
    onCreateFromTemplate: (template: PleadingTemplate) => void;
}

export interface AIDraftingAssistantProps {
  onInsert: (text: string) => void;
  caseContext: {
    title: string;
    summary?: string;
  };
}

export interface PleadingPaperProps {
    rules: FormattingRule;
    children: React.ReactNode;
    className?: string;
}

export interface PleadingCanvasProps {
    document: PleadingDocument;
    rules: FormattingRule;
    readOnly: boolean;
    viewMode: ViewMode;
    onUpdateSection: (id: string, updates: Partial<PleadingSection>) => void;
    relatedCase: Case | null;
}
