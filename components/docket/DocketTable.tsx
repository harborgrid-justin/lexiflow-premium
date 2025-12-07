
import React from 'react';
import { DocketEntry } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { VirtualList } from '../common/VirtualList';
import { InfiniteScrollTrigger } from '../common/InfiniteScrollTrigger';
import { DocketRow } from './DocketRow';

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

  const handleViewDoc = (docId: string) => {
      alert(`Opening Document ${docId}`);
  };

  const renderRow = (entry: DocketEntry, index: number) => (
      <DocketRow 
          key={entry.id}
          entry={entry}
          showCaseColumn={showCaseColumn}
          onSelect={onSelectEntry}
          onSelectCaseId={onSelectCaseId}
          onViewDoc={handleViewDoc}
      />
  );

  return (
    <div className={cn("flex flex-col h-full", theme.surface)}>
        {/* Header */}
        <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider shrink-0", theme.surfaceHighlight, theme.border.default, theme.text.secondary)}>
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
                            className={cn("border-t", theme.surfaceHighlight)}
                        />
                    ) : undefined
                }
            />
        </div>
    </div>
  );
};
