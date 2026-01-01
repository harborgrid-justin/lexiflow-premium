/**
 * @module components/common/GlobalHotkeys
 * @category Common Components - Navigation
 * @description Global keyboard shortcuts handler (Cmd+K for command bar, Alt+C/D/W/R for navigation).
 *
 * THEME SYSTEM USAGE:
 * No direct theme usage - purely functional component.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useEffect } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useNotify } from '@/hooks/useNotify';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface GlobalHotkeysProps {
  onToggleCommand: () => void;
  onNavigate: (path: string) => void;
}

/**
 * GlobalHotkeys - React 18 optimized with React.memo
 */
export const GlobalHotkeys = React.memo<GlobalHotkeysProps>(({ onToggleCommand, onNavigate }) => {
  const notify = useNotify();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD/CTRL + K: Toggle Command Bar
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onToggleCommand();
      }
      
      // CMD/CTRL + / : Show Shortcuts Help (Simulated)
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        notify.info("Shortcuts: Cmd+K (Search), Alt+C (Cases), Alt+D (Docket)");
      }

      // ALT + Navigation Shortcuts
      if (e.altKey) {
        switch(e.key.toLowerCase()) {
          case 'c':
            e.preventDefault();
            onNavigate('cases');
            notify.info("Navigated to Cases");
            break;
          case 'd':
            e.preventDefault();
            onNavigate('docket');
            notify.info("Navigated to Docket");
            break;
          case 'w':
            e.preventDefault();
            onNavigate('workflows');
            notify.info("Navigated to Workflows");
            break;
           case 'r':
            e.preventDefault();
            onNavigate('research');
            notify.info("Navigated to Research");
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCommand, onNavigate, notify]);

  return null;
});
