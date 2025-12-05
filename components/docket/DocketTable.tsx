
import React from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Eye, Lock, FileText, Gavel, Bell, Clock, Hash } from 'lucide-react';
import { DocketEntry, DocketEntryType } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { VirtualList } from '../common/VirtualList';
import { InfiniteScrollTrigger } from '../common/InfiniteScrollTrigger';

interface DocketTableProps {
  entries: DocketEntry[];
  onSelectEntry: (entry: DocketEntry) => void;
  onSelectCaseId: (caseId: string) => void;
  showCaseColumn?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export const DocketTable: React.FC<DocketTableProps> = ({ 
    entries, onSelectEntry, onSelectCaseId, showCaseColumn = true,
    onLoadMore, hasMore = false, isLoadingMore = false
}) => {
  const { theme } = useTheme();

  const getIconForType = (type: string) => {
    const t = type as DocketEntryType;
    switch (t) {
      case 'Order': return <Gavel className={cn("h-4 w-4", theme.status.error.text)} />;
      case 'Filing': return <FileText className={cn("h-4 w-4", theme.primary.text)} />;
      case 'Minute Entry': return <Clock className={cn("h-4 w-4", theme.text.secondary)} />;
      case 'Notice': return <Bell className={cn("h-4 w-4", theme.status.warning.text)} />;
      default: return <FileText className={cn("h-4 w-4", theme.text.tertiary)} />;
    }
  };

  const renderDescription = (entry: DocketEntry) => {
      if (entry.structuredData) {
          const { actionType, actionVerb, documentTitle, filer, additionalText } = entry.structuredData;
          return (
              <span className="text-sm">
                  <span className="font-semibold text-blue-700">{actionType}</span>
                  {documentTitle && <span className="font-bold text-slate-800"> {documentTitle}</span>}
                  {actionVerb && <span className="text-slate-500"> {actionVerb}</span>}
                  {filer && <span className="text-slate-600 italic"> by {filer}</span>}
                  {additionalText && <span className="text-slate-500"> - {additionalText}</span>}
              </span>
          );
      }
      return <span className={cn("font-bold text-sm", theme.text.primary)}>{entry.title}</span>;
  };

  const renderRow = (entry: DocketEntry, index: number) => (
    <div 
        key={entry.id}
        className={cn(
            "flex items-center border-b hover:bg-slate-50 transition-colors cursor-pointer px-6",
            theme.border.light,
            theme.surface
        )}
        style={{ height: 72 }}
        onClick={() => onSelectEntry(entry)}
    >
        {/* Seq & PACER */}
        <div className="w-20 shrink-0 flex flex-col items-start justify-center gap-1">
            <span className={cn("font-mono text-xs px-1.5 py-0.5 rounded font-bold", theme.surfaceHighlight, theme.text.secondary)} title="Internal Seq">#{entry.sequenceNumber}</span>
            {entry.pacerSequenceNumber && (
                <span className={cn("font-mono text-[10px] px-1.5 py-0.5 rounded border flex items-center", theme.border.default, theme.text.tertiary)} title="PACER Seq">
                    <Hash className="h-2 w-2 mr-0.5"/> {entry.pacerSequenceNumber}
                </span>
            )}
        </div>

        {/* Date */}
        <div className={cn("w-24 shrink-0 text-xs font-medium", theme.text.secondary)}>
            {entry.date}
        </div>

        {/* Case Ref */}
        {showCaseColumn && (
            <div className="w-32 shrink-0 px-2">
                 <span 
                    className={cn("text-xs hover:underline font-medium truncate block", theme.primary.text)} 
                    onClick={(e) => { e.stopPropagation(); onSelectCaseId(entry.caseId); }}
                    title={entry.caseId}
                 >
                  {entry.caseId}
                </span>
            </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 px-4">
             <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  {entry.isSealed && <span title="Sealed Document"><Lock className={cn("h-3 w-3", theme.status.error.text)} /></span>}
                  {getIconForType(entry.type)}
                  <div className="truncate">
                    {renderDescription(entry)}
                  </div>
                </div>
                {(!entry.structuredData) && <p className={cn("text-xs text-slate-500 truncate pl-6", theme.text.secondary)}>{entry.description}</p>}
              </div>
        </div>

        {/* Doc Icon */}
        <div className="w-16 shrink-0 text-center">
             {entry.documentId && (
                <Button 
                    size="sm" 
                    variant="ghost" 
                    className={cn("h-8 w-8 p-0", theme.text.tertiary, `hover:${theme.primary.text}`)}
                    onClick={(e) => { e.stopPropagation(); alert(`Opening Document ${entry.documentId}`); }}
                >
                    <Eye className="h-4 w-4"/>
                </Button>
             )}
        </div>

        {/* Deadlines / Status */}
        <div className="w-32 shrink-0 text-right">
              {entry.triggersDeadlines?.slice(0, 1).map(dl => (
                <Badge key={dl.id} variant={dl.status === 'Satisfied' ? 'success' : 'warning'}>
                  {dl.status === 'Satisfied' ? 'Done' : 'Due ' + dl.date.split('-').slice(1).join('/')}
                </Badge>
              ))}
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider bg-slate-50", theme.border.default, theme.text.secondary)}>
            <div className="w-20 shrink-0">Seq / Pacer</div>
            <div className="w-24 shrink-0">Date</div>
            {showCaseColumn && <div className="w-32 shrink-0 px-2">Case Ref</div>}
            <div className="flex-1 px-4">Entry Text</div>
            <div className="w-16 shrink-0 text-center">Doc</div>
            <div className="w-32 shrink-0 text-right">Status</div>
        </div>

        {/* Virtual Body with Footer */}
        <div className="flex-1 min-h-0">
            <VirtualList 
                items={entries}
                height="100%"
                itemHeight={72} 
                renderItem={renderRow}
                emptyMessage="No docket entries found."
                footer={
                    onLoadMore ? (
                        <InfiniteScrollTrigger 
                            onLoadMore={onLoadMore}
                            hasMore={hasMore}
                            isLoading={isLoadingMore}
                            className="border-t bg-slate-50/30"
                        />
                    ) : undefined
                }
            />
        </div>
    </div>
  );
};
