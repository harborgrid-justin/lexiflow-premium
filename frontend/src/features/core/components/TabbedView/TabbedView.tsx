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
import { useId } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface TabbedViewProps {
  header: React.ReactNode;
  tabs: React.ReactNode;
  children: React.ReactNode;
}

/**
 * TabbedView - React 18 optimized with React.memo and useId
 */
export const TabbedView = React.memo<TabbedViewProps>(({ header, tabs, children }) => {
  const regionId = useId();
  return (
    <div className="h-full flex flex-col animate-fade-in">
      {header}
      <div className="mb-4" role="navigation" aria-label="Tab navigation">
        {tabs}
      </div>
      <div id={regionId} role="region" aria-live="polite" className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
});
