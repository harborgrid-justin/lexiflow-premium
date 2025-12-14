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
import React from 'react';
import { LayoutTemplate, ArrowRight } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { VirtualGrid } from '../common/VirtualGrid';

// Utils & Constants
import { cn } from '../../utils/cn';

// Types
import { PleadingTemplate } from '../../types';
import { PleadingTemplatesProps } from './types';

// ============================================================================
// COMPONENT
// ============================================================================
export const PleadingTemplates: React.FC<PleadingTemplatesProps> = ({ templates, onCreateFromTemplate }) => {
    const { theme } = useTheme();

    const renderItem = (template: PleadingTemplate) => (
        <div className="p-2 h-full w-full">
            <div
                key={template.id}
                onClick={() => onCreateFromTemplate(template)}
                className={cn("p-4 border rounded-lg h-full flex flex-col cursor-pointer transition-all hover:shadow-lg group", theme.surface.default, theme.border.default, `hover:${theme.primary.border}`)}
            >
                <div className="flex items-start justify-between mb-2">
                    <div className={cn("p-2 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400")}><LayoutTemplate className="h-6 w-6"/></div>
                </div>
                <h4 className={cn("font-bold text-sm mb-1 flex-1", theme.text.primary)}>{template.name}</h4>
                <p className={cn("text-xs mb-3 opacity-70", theme.text.secondary)}>{template.category}</p>
                <div className={cn("mt-auto text-xs flex items-center justify-end pt-2 border-t font-bold", theme.border.default, theme.primary.text)}>
                    Use Template <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"/>
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
            renderItem={renderItem}
            gap={16}
            emptyMessage="No templates found."
        />
    );
};
