/**
 * @module components/common/ExportMenu
 * @category Common
 * @description Export menu with PDF, CSV, and XML options.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useRef } from 'react';
import { Download, FileText, Table, FileCode } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useClickOutside } from '@/hooks/useClickOutside';

// Components
import { Button } from '@/components/atoms/Button';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface ExportMenuProps {
  onExport: (format: 'pdf' | 'csv' | 'xml') => void;
}

/**
 * ExportMenu - React 18 optimized with React.memo and useId
 */
export const ExportMenu = React.memo<ExportMenuProps>(({ onExport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useClickOutside(menuRef as React.RefObject<HTMLElement>, () => setIsOpen(false));

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <Button 
        variant="secondary" 
        icon={Download} 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        Export
      </Button>

      {isOpen && (
        <div className={cn(
          "absolute right-0 mt-2 w-48 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in-95 duration-100",
          theme.surface.default,
          theme.border.default,
          "border"
        )}>
          <div className="py-1">
            <button
              onClick={() => { onExport('pdf'); setIsOpen(false); }}
              className={cn("w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors", theme.text.primary, `hover:${theme.surface.highlight}`)}
            >
              <FileText className="h-4 w-4 text-red-500"/> PDF Report
            </button>
            <button
              onClick={() => { onExport('csv'); setIsOpen(false); }}
              className={cn("w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors", theme.text.primary, `hover:${theme.surface.highlight}`)}
            >
              <Table className="h-4 w-4 text-green-500"/> CSV Data
            </button>
            <button
              onClick={() => { onExport('xml'); setIsOpen(false); }}
              className={cn("w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors", theme.text.primary, `hover:${theme.surface.highlight}`)}
            >
              <FileCode className="h-4 w-4 text-blue-500"/> XML (LEDES)
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
