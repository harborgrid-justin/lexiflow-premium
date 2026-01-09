/**
 * DocketRow.tsx
 *
 * Individual docket entry row with type icons, badges, and action buttons.
 *
 * @module components/docket/DocketRow
 * @category Case Management - Docket
 */

// External Dependencies
import React from 'react';
import { Gavel, FileText, Clock, Bell, Lock, Eye, Hash, ExternalLink } from 'lucide-react';

// Internal Dependencies - Components
import { Badge } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '@/shared/lib/cn';

// Types & Interfaces
import { DocketEntry, DocketEntryType } from '@/types';

interface DocketRowProps {
    entry: DocketEntry;
    showCaseColumn: boolean;
    onSelect: (entry: DocketEntry) => void;
    onSelectCaseId: (id: string) => void;
    onViewDoc: (id: string) => void;
    isFocused?: boolean;
    dataIndex?: number;
}

export const DocketRow: React.FC<DocketRowProps> = ({
    entry,
    showCaseColumn,
    onSelect,
    onSelectCaseId,
    onViewDoc,
    isFocused = false,
    dataIndex
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
                    <span className={cn("font-semibold", theme.text.link)}>{actionType}</span>
                    {documentTitle && <span className={cn("font-bold", theme.text.primary)}> {documentTitle}</span>}
                    {actionVerb && <span className={theme.text.secondary}> {actionVerb}</span>}
                    {filer && <span className={cn("italic", theme.text.secondary)}> by {filer}</span>}
                    {additionalText && <span className={theme.text.tertiary}> - {additionalText}</span>}
                </span>
            );
        }
        return <span className={cn("font-bold text-sm", theme.text.primary)}>{entry.title}</span>;
    };

    return (
        <div
            className={cn(
                "flex items-center border-b transition-colors cursor-pointer px-6 group",
                theme.border.default,
                theme.surface.default,
                `hover:${theme.surface.highlight}`,
                isFocused && "ring-2 ring-inset ring-blue-500 bg-blue-50 dark:bg-blue-900"
            )}
            style={{ height: 72 }}
            onClick={() => onSelect(entry)}
            role="row"
            aria-selected={isFocused}
            aria-rowindex={dataIndex !== undefined ? dataIndex + 1 : undefined}
            tabIndex={isFocused ? 0 : -1}
            data-index={dataIndex}
        >
            {/* Seq & PACER */}
            <div className="w-20 shrink-0 flex flex-col items-start justify-center gap-1">
                <span className={cn("font-mono text-xs px-1.5 py-0.5 rounded font-bold", theme.surface.highlight, theme.text.secondary)} title="Internal Seq">#{entry.sequenceNumber}</span>
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
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); onSelectCaseId(entry.caseId); }}
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
                    {(!entry.structuredData) && <p className={cn("text-xs truncate pl-6", theme.text.secondary)}>{entry.description}</p>}
                  </div>
            </div>

            {/* Doc Icon */}
            <div className="w-16 shrink-0 text-center">
                 {entry.documentId && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className={cn("h-8 w-8 p-0", theme.text.tertiary, `hover:${theme.primary.text}`)}
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); onViewDoc(entry.documentId!); }}
                    >
                        <Eye className="h-4 w-4"/>
                    </Button>
                 )}
            </div>

            {/* Deadlines / Status */}
            <div className="w-32 shrink-0 text-right flex justify-end">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="xs"
                        variant="ghost"
                        icon={ExternalLink}
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); onSelect(entry); }}
                        className={cn("text-slate-500 transition-colors", `hover:${theme.text.link}`)}
                    >
                        Details
                    </Button>
                </div>
                  {entry.triggersDeadlines?.slice(0, 1).map(dl => (
                    <Badge key={dl.id} variant={dl.status === 'Satisfied' ? 'success' : 'warning'}>
                      {dl.status === 'Satisfied' ? 'Done' : 'Due ' + dl.date.split('-').slice(1).join('/')}
                    </Badge>
                  ))}
            </div>
        </div>
    );
};
