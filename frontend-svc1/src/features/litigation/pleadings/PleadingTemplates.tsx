/**
 * @module components/pleading/PleadingTemplates
 * @category Pleadings
 * @description Template library for pleading creation.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { ArrowRight, LayoutTemplate, Loader2 } from 'lucide-react';
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
import { PleadingTemplate } from '@/types';
import { PleadingTemplatesProps } from './types';

// ============================================================================
// COMPONENT
// ============================================================================
export const PleadingTemplates: React.FC<PleadingTemplatesProps> = ({ templates, onCreateFromTemplate, isLoading }) => {
    const { theme } = useTheme();

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
            </div>
        );
    }

    if (templates.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className={cn("text-center py-12", theme.text.tertiary)}>
                    <LayoutTemplate className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">No templates available.</p>
                    <p className="text-xs mt-2 opacity-60">Templates will appear here once configured.</p>
                </div>
            </div>
        );
    }

    const renderItem = (template: PleadingTemplate) => (
        <div className="p-2 h-full w-full">
            <div
                key={template.id}
                onClick={() => onCreateFromTemplate(template)}
                className={cn("p-4 border rounded-lg h-full flex flex-col cursor-pointer transition-all hover:shadow-lg group", theme.surface.default, theme.border.default, `hover:${theme.primary.border}`)}
            >
                <div className="flex items-start justify-between mb-2">
                    <div className={cn("p-2 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400")}><LayoutTemplate className="h-6 w-6" /></div>
                </div>
                <h4 className={cn("font-bold text-sm mb-1 flex-1", theme.text.primary)}>{template.name}</h4>
                <p className={cn("text-xs mb-3 opacity-70", theme.text.secondary)}>{template.category}</p>
                <div className={cn("mt-auto text-xs flex items-center justify-end pt-2 border-t font-bold", theme.border.default, theme.primary.text)}>
                    Use Template <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </div>
    );

    return (
        <VirtualGrid
            items={templates}
            height="100%"
            itemHeight={180}
            itemWidth={220}
            renderItem={(item: unknown) => renderItem(item as PleadingTemplate)}
            gap={16}
            emptyMessage="No templates found."
        />
    );
};
