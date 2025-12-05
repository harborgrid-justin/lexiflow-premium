
import React, { useEffect } from 'react';
import { useNotify } from '../../hooks/useNotify';

interface GlobalHotkeysProps {
  onToggleCommand: () => void;
  onNavigate: (path: string) => void;
}

export const GlobalHotkeys: React.FC<GlobalHotkeysProps> = ({ onToggleCommand, onNavigate }) => {
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
};
