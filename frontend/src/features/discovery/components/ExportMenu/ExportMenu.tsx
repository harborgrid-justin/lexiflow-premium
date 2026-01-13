/**
 * @module components/common/ExportMenu
 * @category Common
 * @description Export menu with PDF, CSV, and XML options.
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic, interruptible
 * - Guideline 28: Theme usage is pure function (memoized computed styles)
 * - Guideline 34: useTheme() is side-effect free read
 * - Guideline 33: Uses isPendingThemeChange for smooth transitions
 * 
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useRef, useMemo } from 'react';
import { Download, FileText, Table, FileCode } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/features/theme';
import { useClickOutside } from '@/shared/hooks/useClickOutside';

// Components
import { Button } from '@/shared/ui/atoms/Button/Button';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

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
  
  // Guideline 34: Side-effect free context read
  const { theme, isPendingThemeChange } = useTheme();

  // Guideline 28: Memoize computed theme values (pure function of theme)
  const menuStyles = useMemo(() => ({
    surface: theme.surface.default,
    border: theme.border.default,
    highlight: theme.surface.highlight,
    text: theme.text.primary,
  }), [theme]);

  useClickOutside(menuRef as React.RefObject<HTMLElement>, () => setIsOpen(false));

  return (
    <div className={cn(
      "relative inline-block text-left",
      isPendingThemeChange && "transition-opacity duration-300 opacity-75"
    )} ref={menuRef}>
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
          menuStyles.surface,
          menuStyles.border,
          "border"
        )}>
          <div className="py-1">
            <button
              onClick={() => { onExport('pdf'); setIsOpen(false); }}
              className={cn("w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors", menuStyles.text, `hover:${menuStyles.highlight}`)}
            >
              <FileText className="h-4 w-4 text-red-500"/> PDF Report
            </button>
            <button
              onClick={() => { onExport('csv'); setIsOpen(false); }}
              className={cn("w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors", menuStyles.text, `hover:${menuStyles.highlight}`)}
            >
              <Table className="h-4 w-4 text-green-500"/> CSV Data
            </button>
            <button
              onClick={() => { onExport('xml'); setIsOpen(false); }}
              className={cn("w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors", menuStyles.text, `hover:${menuStyles.highlight}`)}
            >
              <FileCode className="h-4 w-4 text-blue-500"/> XML (LEDES)
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
