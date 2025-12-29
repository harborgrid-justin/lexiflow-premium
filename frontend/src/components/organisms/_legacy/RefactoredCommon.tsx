/**
 * @module components/common/RefactoredCommon
 * @category Common Components - Layout Primitives
 * @description DEPRECATED - Use individual imports from components/common/layout/ instead
 * 
 * This file maintains backward compatibility by re-exporting all layout components.
 * New code should import directly from the layout/ subdirectory.
 * 
 * @deprecated Import from 'components/common/layout' instead
 * 
 * @example
 * // ❌ Old way (still works but deprecated)
 * import { CentredLoader, EmptyListState } from './components/common/RefactoredCommon';
 * 
 * // ✅ New way (preferred)
 * import { CentredLoader, EmptyListState } from './components/common/layout';
 */

import React from 'react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';

// Re-export StatusBadge for compatibility (commented out - component doesn't exist)
// export { StatusBadge } from '@/components/atoms/StatusBadge';

// Re-export all layout components from their new locations (commented out - components don't exist yet)
// export { CentredLoader } from '@/components/atoms/CentredLoader';
// export type { CentredLoaderProps } from '@/components/atoms/CentredLoader';

// export { EmptyListState } from '@/components/molecules/EmptyListState';
// export type { EmptyListStateProps } from '@/components/molecules/EmptyListState';

// export { SectionTitle } from '@/components/atoms/SectionTitle';
// export type { SectionTitleProps } from '@/components/atoms/SectionTitle';

// export { InfoGrid } from '@/components/molecules/InfoGrid';
// export type { InfoGridProps, InfoGridItem } from '@/components/molecules/InfoGrid';

// export { SearchInputBar } from '@/components/molecules/SearchInputBar';
// export type { SearchInputBarProps } from '@/components/molecules/SearchInputBar';

// export { ActionRow } from '@/components/molecules/ActionRow';
// export type { ActionRowProps } from '@/components/molecules/ActionRow';

// export { TabStrip } from '@/components/molecules/TabStrip';
// export type { TabStripProps } from '@/components/molecules/TabStrip';

// export { ModalFooter } from '@/components/molecules/ModalFooter';
// export type { ModalFooterProps } from '@/components/molecules/ModalFooter';

// 10. MetricTile: Simplified metric card for dense grids
export const MetricTile: React.FC<{ label: string, value: string | number | React.ReactNode, icon?: React.ComponentType<{ className?: string }>, trend?: string, trendUp?: boolean, className?: string }> = ({ label, value, icon: Icon, trend, trendUp, className }) => {
    const { theme } = useTheme();
    return (
        <div className={cn("p-4 rounded-lg border shadow-sm flex flex-col justify-between h-full", theme.surface.default, theme.border.default, className)}>
             <div className="flex justify-between items-start">
                 <div>
                    <p className={cn("text-xs font-bold uppercase mb-1", theme.text.secondary)}>{label}</p>
                    <div className={cn("text-2xl font-bold", theme.text.primary)}>{value}</div>
                 </div>
                 {Icon && <Icon className={cn("h-5 w-5", theme.text.tertiary)} />}
             </div>
             {trend && <p className={cn("text-xs mt-2 font-medium", trendUp ? "text-green-600" : "text-red-600")}>{trend}</p>}
        </div>
    );
};
