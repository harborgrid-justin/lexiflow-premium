/**
 * @module components/common/DiffViewer
 * @category Common
 * @description Side-by-side text diff viewer.
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
interface DiffViewerProps {
  oldText: string;
  newText: string;
  oldLabel?: string;
  newLabel?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ oldText, newText, oldLabel = "Original", newLabel = "Modified" }) => {
  const { theme } = useTheme();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      <div className={cn("flex flex-col h-full border rounded-lg overflow-hidden", theme.status.error.bg, theme.status.error.border)}>
        <div className={cn("px-4 py-2 border-b font-bold text-xs uppercase flex justify-between items-center", theme.status.error.border, theme.status.error.text)}>
          <span>{oldLabel}</span>
        </div>
        <div className={cn("p-4 flex-1 overflow-y-auto text-sm font-mono whitespace-pre-wrap leading-relaxed", theme.text.primary)}>
          {oldText}
        </div>
      </div>
      <div className={cn("flex flex-col h-full border rounded-lg overflow-hidden", theme.status.success.bg, theme.status.success.border)}>
        <div className={cn("px-4 py-2 border-b font-bold text-xs uppercase flex justify-between items-center", theme.status.success.border, theme.status.success.text)}>
          <span>{newLabel}</span>
        </div>
        <div className={cn("p-4 flex-1 overflow-y-auto text-sm font-mono whitespace-pre-wrap leading-relaxed", theme.text.primary)}>
          {newText}
        </div>
      </div>
    </div>
  );
};
