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
import { CheckSquare, FileText, Loader2, Wand2 } from 'lucide-react';
import React from 'react';

// Internal Dependencies - Components
import { Button } from '@/components/ui/atoms/Button';
import { TagList } from '@/components/ui/molecules/TagList/TagList';

// Internal Dependencies - Services & Utils
import { cn } from '@/shared/lib/cn';

// Types & Interfaces
import { LegalDocument } from '@/types';

interface CaseDocumentItemProps {
  doc: LegalDocument;
  analyzingId: string | null;
  onAnalyze: (doc: LegalDocument) => void;
  onTaskClick: (doc: LegalDocument) => void;
}

export const CaseDocumentItem: React.FC<CaseDocumentItemProps> = ({ doc, analyzingId, onAnalyze, onTaskClick }) => {
  const isAnalyzing = analyzingId === doc.id;

  return (
    <div className={cn("p-4 rounded-lg border shadow-sm transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface border-border hover:bg-surface")}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={cn("p-3 rounded-lg border bg-surface border-border")}>
          <FileText className={cn("h-6 w-6 text-primary")} />
        </div>
        <div className="min-w-0">
          <h4 className={cn("font-bold truncate text-text")}>{doc.title}</h4>
          <div className={cn("flex items-center gap-3 text-xs mt-1 text-text-muted")}>
            <span>{doc.type}</span>
            <span>•</span>
            <span>{doc.uploadDate}</span>
            <span>•</span>
            <span className={cn("font-medium text-text")}>{doc.status}</span>
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
