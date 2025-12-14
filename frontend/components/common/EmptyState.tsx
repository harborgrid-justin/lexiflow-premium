/**
 * @module components/common/EmptyState
 * @category Common
 * @description Empty state placeholder with icon and action.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { LucideIcon } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Utils & Constants
import { cn } from '../../utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action, className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 text-center h-full w-full",
      "border-2 border-dashed rounded-xl",
      theme.border.default,
      theme.text.tertiary,
      className
    )}>
      <div className={cn("p-4 rounded-full mb-4", theme.surface.highlight)}>
        <Icon className={cn("h-12 w-12 opacity-40", theme.text.tertiary)} />
      </div>
      <h3 className={cn("text-lg font-semibold mb-1", theme.text.primary)}>{title}</h3>
      <p className={cn("text-sm max-w-sm mb-6", theme.text.secondary)}>{description}</p>
      {action}
    </div>
  );
};