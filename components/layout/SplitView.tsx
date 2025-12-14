/**
 * @module components/layout/SplitView
 * @category Layout
 * @description Two-column split view layout with responsive sidebar.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';

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
interface SplitViewProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
  showSidebarOnMobile?: boolean;
  className?: string;
}

export const SplitView: React.FC<SplitViewProps> = ({ 
  sidebar, 
  content, 
  showSidebarOnMobile = true, 
  className = '' 
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn(
      "flex-1 flex flex-col md:flex-row rounded-lg overflow-hidden min-h-0",
      theme.surface.default,
      theme.border.default,
      "border shadow-sm",
      className
    )}>
      <div className={cn(
        "w-full md:w-80 lg:w-96 flex flex-col h-full border-r",
        theme.border.default,
        theme.surface.highlight,
        showSidebarOnMobile ? 'flex' : 'hidden md:flex'
      )}>
        {sidebar}
      </div>
      <div className={cn(
        "flex-1 flex flex-col min-w-0 h-full",
        theme.surface.default, // Replaced bg-white
        !showSidebarOnMobile ? 'flex' : 'hidden md:flex'
      )}>
        {content}
      </div>
    </div>
  );
};
