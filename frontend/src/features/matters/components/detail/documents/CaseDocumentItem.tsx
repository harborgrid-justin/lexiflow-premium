/**
 * CaseDocumentItem.tsx
 * 
 * Individual document card component with AI analysis trigger,
 * task creation, and tag display.
 * 
 * @module components/case-detail/documents/CaseDocumentItem
 * @category Case Management - Documents
 */

// External Dependencies
import React from 'react';
import { FileText, Wand2, CheckSquare, Loader2 } from 'lucide-react';

// Internal Dependencies - Components
import { Button } from '@/components/atoms/Button';
import { TagList } from '@/components/molecules/TagList';

// Internal Dependencies - Services & Utils
import { cn } from '@/utils/cn';

// Types & Interfaces
import { LegalDocument } from '@/types';
import type { ThemeTokens } from '@/components/theme/tokens';

interface CaseDocumentItemProps {
  doc: LegalDocument;
  analyzingId: string | null;
  onAnalyze: (doc: LegalDocument) => void;
  onTaskClick: (doc: LegalDocument) => void;
  theme: ThemeTokens;
}

export const CaseDocumentItem: React.FC<CaseDocumentItemProps> = ({ doc, analyzingId, onAnalyze, onTaskClick, theme }) => {
  const isAnalyzing = analyzingId === doc.id;

  return (
    <div className={cn("p-4 rounded-lg border shadow-sm transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", theme.surface.default, theme.border.default, `hover:${theme.surface.highlight}`)}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={cn("p-3 rounded-lg border", theme.surface.highlight, theme.border.default)}>
          <FileText className={cn("h-6 w-6", theme.primary.text)} />
        </div>
        <div className="min-w-0">
          <h4 className={cn("font-bold truncate", theme.text.primary)}>{doc.title}</h4>
          <div className={cn("flex items-center gap-3 text-xs mt-1", theme.text.secondary)}>
            <span>{doc.type}</span>
            <span>•</span>
            <span>{doc.uploadDate}</span>
            <span>•</span>
            <span className={cn("font-medium", theme.text.primary)}>{doc.status}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-center">
        <TagList tags={doc.tags.slice(0, 2)} />
        <Button 
          variant="outline" 
          size="sm" 
          icon={isAnalyzing ? Loader2 : Wand2} 
          onClick={() => onAnalyze(doc)} 
          isLoading={isAnalyzing}
          className="w-28"
        >
          {isAnalyzing ? 'Analyzing...' : 'AI Analyze'}
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          icon={CheckSquare} 
          onClick={() => onTaskClick(doc)}
        >
          Task
        </Button>
      </div>
    </div>
  );
};
