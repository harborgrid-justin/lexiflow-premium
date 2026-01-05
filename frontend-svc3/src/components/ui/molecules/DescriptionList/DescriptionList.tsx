/**
 * @module components/common/DescriptionList
 * @category Common
 * @description Description list layout with grid support.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useId } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface DescriptionItemProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

/**
 * DescriptionList - React 18 optimized with React.memo
 */
export const DescriptionList = React.memo<{ children: React.ReactNode; className?: string; cols?: number }>(({ children, className = '', cols = 2 }) => {
  const gridCols = cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-1 md:grid-cols-2' : cols === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  return (
    <div className={cn(`grid ${gridCols} gap-6`, className)}>
      {children}
    </div>
  );
});

/**
 * DescriptionItem - React 18 optimized with React.memo and useId
 */
export const DescriptionItem = React.memo<DescriptionItemProps>(({ label, value, className = '' }) => {
  const { theme } = useTheme();
  const termId = useId();
  return (
    <dl className={className}>
      <dt id={termId} className={cn("text-xs font-bold uppercase mb-1", theme.text.secondary)}>{label}</dt>
      <dd aria-labelledby={termId} className={cn("text-sm font-medium break-words", theme.text.primary)}>{value}</dd>
    </dl>
  );
});
