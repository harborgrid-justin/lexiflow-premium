/**
 * CaseRow.tsx
 *
 * Memoized case table row component for virtual scrolling performance.
 * Displays case metadata with keyboard navigation and hover prefetching.
 *
 * @module components/case-list/CaseRow
 * @category Case Management - Table Components
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { ACTIVE_CASE_COLUMNS } from '@/config/cases.config';
import { Eye, User } from 'lucide-react';
import { memo } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Currency } from '@/components/atoms/Currency/Currency';
import { StatusBadge } from '@/components/atoms/StatusBadge/StatusBadge';

// Hooks & Context
import { useTheme } from '@/contexts/ThemeContext';

// Utils
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { Case } from '@/types';

interface CaseRowProps {
    caseData: Case;
    onSelect: (c: Case) => void;
    onPrefetch: (id: string) => void;
}

// OPTIMIZATION: Memoize row to prevent re-renders during parent updates or unrelated state changes.
export const CaseRow = memo<CaseRowProps>(({ caseData, onSelect, onPrefetch }) => {
    const { theme } = useTheme();

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(caseData);
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            className={cn("flex items-center border-b hover:bg-slate-50 transition-colors h-16 px-6 group outline-none focus:bg-slate-50 focus:ring-1 focus:ring-inset focus:ring-blue-500", theme.border.default)}
            onMouseEnter={() => onPrefetch(caseData.id)}
            onClick={() => onSelect(caseData)}
            onKeyDown={handleKeyDown}
            style={{
                contentVisibility: 'auto', // OPTIMIZATION: Browser skips layout work for off-screen rows
                containIntrinsicSize: '0 64px'
            }}
        >
            <div style={{ width: ACTIVE_CASE_COLUMNS[0].width }} className="flex flex-col items-start pr-4 min-w-0">
                <span
                    className={cn("font-bold text-sm transition-colors flex items-center hover:underline cursor-pointer truncate w-full", theme.primary.text)}
                    title={caseData.title}
                >
                    {caseData.title}
                </span>
                <span className={cn("text-xs font-mono mt-0.5 opacity-70", theme.text.secondary)}>{caseData.id}</span>
            </div>
            <div style={{ width: ACTIVE_CASE_COLUMNS[1].width }}><StatusBadge status={caseData.matterType} /></div>
            <div style={{ width: ACTIVE_CASE_COLUMNS[2].width }} className="flex items-center text-sm text-slate-500 min-w-0 pr-2">
                <User className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                <span className="truncate" title={caseData.client}>{caseData.client}</span>
            </div>
            <div style={{ width: ACTIVE_CASE_COLUMNS[3].width }}><Currency value={caseData.value || 0} className={cn("font-medium text-sm", theme.text.primary)} /></div>
            <div className="w-[10%]">
                <StatusBadge status={caseData.status} />
            </div>
            <div className="w-[5%] flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                <button
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onSelect(caseData); }}
                    className={cn("p-1.5 rounded-md transition-colors", theme.text.secondary, `hover:${theme.surface.highlight}`, `hover:${theme.primary.text}`)}
                    title="View Details"
                    tabIndex={-1}
                >
                    <Eye className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}, (prev, next) => prev.caseData === next.caseData); // Strict equality check

CaseRow.displayName = 'CaseRow';
