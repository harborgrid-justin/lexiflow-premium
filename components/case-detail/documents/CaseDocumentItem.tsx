import React from 'react';
import { LegalDocument } from '../../../types';
import { FileText, Wand2, CheckSquare, Loader2 } from 'lucide-react';
import { Button } from '../../common/Button';
import { cn } from '../../../utils/cn';
import { TagList } from '../../common/Primitives';

interface CaseDocumentItemProps {
  doc: LegalDocument;
  analyzingId: string | null;
  onAnalyze: (doc: LegalDocument) => void;
  onTaskClick: (doc: LegalDocument) => void;
  theme: any;
}

export const CaseDocumentItem: React.FC<CaseDocumentItemProps> = ({ doc, analyzingId, onAnalyze, onTaskClick, theme }) => {
  const isAnalyzing = analyzingId === doc.id;

  return (
    <div className={cn("p-4 rounded-lg border shadow-sm transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", theme.surface, theme.border.default, `hover:${theme.surfaceHighlight}`)}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={cn("p-3 rounded-lg border", theme.surfaceHighlight, theme.border.default)}>
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