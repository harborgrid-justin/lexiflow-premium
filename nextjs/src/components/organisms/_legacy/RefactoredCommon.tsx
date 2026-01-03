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
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';

// Re-export StatusBadge for compatibility (commented out - component doesn't exist)
// export { StatusBadge } from '@/components/atoms';

// Re-export all layout components from their new locations (commented out - components don't exist yet)
// export { CentredLoader } from '@/components/atoms';
// export type { CentredLoaderProps } from '@/components/atoms';

// export { EmptyListState } from '@/components/molecules';
// export type { EmptyListStateProps } from '@/components/molecules';

// export { SectionTitle } from '@/components/atoms';
// export type { SectionTitleProps } from '@/components/atoms';

// export { InfoGrid } from '@/components/molecules';
// export type { InfoGridProps, InfoGridItem } from '@/components/molecules';

// export { SearchInputBar } from '@/components/molecules';
// export type { SearchInputBarProps } from '@/components/molecules';

// export { ActionRow } from '@/components/molecules';
// export type { ActionRowProps } from '@/components/molecules';

// export { TabStrip } from '@/components/molecules';
// export type { TabStripProps } from '@/components/molecules';

// export { ModalFooter } from '@/components/molecules';
// export type { ModalFooterProps } from '@/components/molecules';

// Stub components for backward compatibility
export const EmptyListState: React.FC<{ title?: string; message?: string; icon?: React.ReactNode; action?: React.ReactNode; className?: string }> = ({ title = 'No items', message, icon, action, className }) => {
    const { theme } = useTheme();
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
            {icon && <div className="mb-4 text-gray-400">{icon}</div>}
            <h3 className={cn("text-lg font-medium", theme.text.primary)}>{title}</h3>
            {message && <p className={cn("mt-1 text-sm", theme.text.secondary)}>{message}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};

export const SearchInputBar: React.FC<{ value?: string; onChange?: (value: string) => void; placeholder?: string; className?: string }> = ({ value = '', onChange, placeholder = 'Search...', className }) => {
    const { theme } = useTheme();
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className={cn("w-full px-4 py-2 rounded-lg border", theme.surface.default, theme.border.default, theme.text.primary, className)}
        />
    );
};

export const ActionRow: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => {
    return <div className={cn("flex items-center gap-2", className)}>{children}</div>;
};

export const StatusBadge: React.FC<{ status: string; variant?: 'success' | 'warning' | 'error' | 'info' | 'default'; className?: string }> = ({ status, variant = 'default', className }) => {
    const variantClasses = {
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        default: 'bg-gray-100 text-gray-800',
    };
    return <span className={cn("px-2 py-1 text-xs font-medium rounded-full", variantClasses[variant], className)}>{status}</span>;
};

export const SectionTitle: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode; className?: string }> = ({ title, subtitle, action, className }) => {
    const { theme } = useTheme();
    return (
        <div className={cn("flex items-center justify-between mb-4", className)}>
            <div>
                <h2 className={cn("text-lg font-semibold", theme.text.primary)}>{title}</h2>
                {subtitle && <p className={cn("text-sm", theme.text.secondary)}>{subtitle}</p>}
            </div>
            {action}
        </div>
    );
};

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
