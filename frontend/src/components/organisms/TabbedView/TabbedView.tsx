/**
 * @module components/layout/TabbedView
 * @category Layout
 * @description Tabbed view layout with header and tab navigation.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface TabbedViewProps {
  header: React.ReactNode;
  tabs: React.ReactNode;
  children: React.ReactNode;
}

export const TabbedView: React.FC<TabbedViewProps> = ({ header, tabs, children }) => {
  return (
    <div className="h-full flex flex-col animate-fade-in">
      {header}
      <div className="mb-4">
        {tabs}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
};
