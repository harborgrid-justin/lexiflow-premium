/**
 * @module components/pleading/PleadingDrafts
 * @category Pleadings
 * @description Drafts view for in-progress pleadings.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Clock, FileText, Loader2 } from 'lucide-react';
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Components
import { VirtualGrid } from '@/components/organisms/VirtualGrid/VirtualGrid';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import { PleadingDocument } from '@/types';
import { PleadingDraftsProps } from './types';

// ============================================================================
// COMPONENT
// ============================================================================
export const PleadingDrafts: React.FC<PleadingDraftsProps> = ({ pleadings, onEdit, isLoading }) => {
    const { theme } = useTheme();

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    if (pleadings.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className={cn("text-center py-12", theme.text.tertiary)}>
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">No pleadings found.</p>
                    <p className="text-xs mt-2 opacity-60">Create a new pleading to get started.</p>
                </div>
            </div>
        );
    }

    const renderItem = (item: PleadingDocument) => (
        <div
            key={item.id}
            className="p-2 h-full w-full"
        >
            <div
                className={cn("border rounded-lg h-full flex flex-col cursor-pointer transition-all hover:shadow-md group p-4", theme.surface.default, theme.border.default, `hover:${theme.primary.border}`)}
                onClick={() => onEdit(item)}
            >
                <div className="flex items-start justify-between mb-2">
                    <div className={cn("p-2 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400")}><FileText className="h-6 w-6" /></div>
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium border", theme.surface.highlight, theme.text.secondary, theme.border.default)}>{item.status}</span>
                </div>
                <h4 className={cn("font-bold text-sm mb-1 line-clamp-2 flex-1", theme.text.primary)}>{item.title}</h4>
                <p className={cn("text-xs mb-3 font-mono opacity-70", theme.text.secondary)}>{item.caseId}</p>
                <div className={cn("mt-auto text-xs flex items-center pt-2 border-t", theme.border.default, theme.text.tertiary)}>
                    <Clock className="h-3 w-3 mr-1" /> Last edited: {item.lastAutoSaved ? new Date(item.lastAutoSaved).toLocaleDateString() : 'Just now'}
                </div>
            </div>
        </div>
    );

    return (
        <VirtualGrid
            items={pleadings}
            height="100%"
            itemHeight={180}
            itemWidth={250}
            renderItem={(item: unknown) => renderItem(item as PleadingDocument)}
            gap={16}
            emptyMessage="No pleadings found. Create one to get started."
        />
    );
};
