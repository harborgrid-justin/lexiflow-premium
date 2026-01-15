/**
 * @module components/correspondence/CommunicationLog
 * @category Correspondence
 * @description Communication log with message threading.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useCallback, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Mail, Paperclip, Shield } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/theme';

// Components
import { VirtualList } from '@/components/organisms/VirtualList/VirtualList';
import { Badge } from '@/components/atoms/Badge/Badge';

// Utils & Constants
import { CommunicationStatus } from '@/types/enums';
import { cn } from '@/lib/cn';

// Types
import { CommunicationItem } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface CommunicationLogProps {
    /** List of communication items. */
    items: CommunicationItem[];
    /** Callback when an item is selected. */
    onSelect: (item: CommunicationItem) => void;
    /** Currently selected item ID. */
    selectedId?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CommunicationLog = React.memo<CommunicationLogProps>(({ items, onSelect, selectedId }) => {
    const { theme } = useTheme();
    const [focusedIndex, setFocusedIndex] = useState(0);

    // Keyboard navigation
    useKeyboardShortcuts([
        {
            key: 'ArrowDown',
            callback: () => {
                const newIndex = Math.min(focusedIndex + 1, items.length - 1);
                setFocusedIndex(newIndex);
            },
            description: 'Move down'
        },
        {
            key: 'ArrowUp',
            callback: () => {
                const newIndex = Math.max(focusedIndex - 1, 0);
                setFocusedIndex(newIndex);
            },
            description: 'Move up'
        },
        {
            key: 'Enter',
            callback: () => {
                if (items[focusedIndex]) {
                    onSelect(items[focusedIndex]);
                }
            },
            description: 'Open item'
        }
    ]);

    // Memoized render function
    const renderRow = useCallback((item: CommunicationItem) => (
        <div
            key={item.id}
            onClick={() => onSelect(item)}
            className={cn(
                "flex items-center border-b px-4 h-[60px] cursor-pointer transition-colors hover:bg-slate-50",
                theme.border.default,
                selectedId === item.id ? theme.surface.highlight : ""
            )}
        >
            <div className="w-24 shrink-0">
                <div className={cn("flex items-center text-xs font-bold", item.direction === 'Inbound' ? "text-green-600" : "text-blue-600")}>
                    {item.direction === 'Inbound' ? <ArrowDownLeft className="h-4 w-4 mr-1" /> : <ArrowUpRight className="h-4 w-4 mr-1" />}
                    {item.direction}
                </div>
            </div>
            <div className="w-32 shrink-0 flex items-center gap-2 text-sm">
                <Mail className={cn("h-4 w-4", theme.text.tertiary)} />
                <span className={theme.text.primary}>{item.type}</span>
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-2 pr-4">
                {item.isPrivileged && (
                    <div title="Privileged" className="shrink-0">
                        <Shield className="h-3 w-3 text-amber-500" />
                    </div>
                )}
                <span className={cn("font-medium truncate", theme.text.primary)}>{item.subject}</span>
                {item.hasAttachment && <Paperclip className="h-3 w-3 text-slate-400 shrink-0" />}
            </div>
            <div className="w-40 shrink-0 flex flex-col text-xs">
                <span className={theme.text.primary}>{item.direction === 'Inbound' ? item.sender : item.recipient}</span>
                <span className={theme.text.tertiary}>{item.caseId}</span>
            </div>
            <div className="w-24 shrink-0 text-xs text-right text-slate-500 mr-4">{item.date}</div>
            <div className="w-20 shrink-0 text-right">
                <Badge variant={
                    item.status === CommunicationStatus.SENT || item.status === CommunicationStatus.READ
                        ? 'success'
                        : item.status === CommunicationStatus.FAILED
                            ? 'error'
                            : 'warning'
                }>{item.status}</Badge>
            </div>
        </div>
    ), [theme, selectedId, onSelect]);

    // Memoize items for VirtualList
    const memoizedItems = useMemo(() => items, [items]);

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Fixed Header */}
            <div className={cn("flex items-center px-4 py-3 border-b font-bold text-xs uppercase tracking-wider bg-slate-50 shrink-0", theme.border.default, theme.text.secondary)}>
                <div className="w-24">Direction</div>
                <div className="w-32">Type</div>
                <div className="flex-1">Subject</div>
                <div className="w-40">Correspondent</div>
                <div className="w-24 text-right mr-4">Date</div>
                <div className="w-20 text-right">Status</div>
            </div>

            <div className="flex-1 min-h-0 relative">
                <VirtualList
                    items={memoizedItems}
                    height="100%"
                    itemHeight={60}
                    renderItem={renderRow}
                    emptyMessage="No communications found."
                />
            </div>
        </div>
    );
});
CommunicationLog.displayName = 'CommunicationLog';

CommunicationLog.displayName = 'CommunicationLog';
