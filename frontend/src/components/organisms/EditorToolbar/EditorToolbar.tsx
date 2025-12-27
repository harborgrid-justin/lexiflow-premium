/**
 * @module components/common/EditorToolbar
 * @category Common
 * @description Rich text editor toolbar with formatting controls.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, Highlighter, Save } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface EditorToolbarProps {
  wordCount: number;
  onCmd: (cmd: string, val?: string) => void;
  onSave?: () => void;
}

/**
 * EditorToolbar - React 18 optimized with React.memo
 */
export const EditorToolbar = React.memo<EditorToolbarProps>(({ wordCount, onCmd, onSave }) => {
  const { theme } = useTheme();
  const btnClass = cn(
      "p-1.5 rounded transition-colors border border-transparent",
      theme.text.primary,
      `hover:${theme.surface.default}`,
      `hover:${theme.primary.text}`,
      `hover:${theme.border.default}`
  );

  return (
    <div className={cn("flex items-center gap-1 p-2 border-b flex-wrap", theme.surface.highlight, theme.border.default)}>
      <div className={cn("flex items-center gap-0.5 border-r pr-2 mr-2", theme.border.default)}>
        <select className={cn("bg-transparent text-sm font-medium h-8 border-none outline-none cursor-pointer rounded px-1 transition-colors", theme.text.primary, `hover:${theme.surface.default}`)} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onCmd('formatBlock', e.target.value)}>
            <option value="p">Normal</option>
            <option value="h2">Heading 1</option>
            <option value="h3">Heading 2</option>
            <option value="h4">Heading 3</option>
        </select>
      </div>
      <div className={cn("flex items-center gap-0.5 border-r pr-2 mr-2", theme.border.default)}>
        <button onClick={() => onCmd('bold')} className={btnClass} title="Bold"><Bold className="h-4 w-4"/></button>
        <button onClick={() => onCmd('italic')} className={btnClass} title="Italic"><Italic className="h-4 w-4"/></button>
        <button onClick={() => onCmd('underline')} className={btnClass} title="Underline"><Underline className="h-4 w-4"/></button>
        <button onClick={() => onCmd('hiliteColor', '#fef08a')} className={btnClass} title="Highlight"><Highlighter className="h-4 w-4"/></button>
      </div>
      <div className={cn("flex items-center gap-0.5 border-r pr-2 mr-2", theme.border.default)}>
        <button onClick={() => onCmd('justifyLeft')} className={btnClass}><AlignLeft className="h-4 w-4"/></button>
        <button onClick={() => onCmd('justifyCenter')} className={btnClass}><AlignCenter className="h-4 w-4"/></button>
        <button onClick={() => onCmd('justifyRight')} className={btnClass}><AlignRight className="h-4 w-4"/></button>
        <button onClick={() => onCmd('insertUnorderedList')} className={btnClass}><List className="h-4 w-4"/></button>
      </div>
      
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-2">
          <span className={cn("text-xs font-mono mr-2", theme.text.tertiary)}>{wordCount} words</span>
          {onSave && (
            <button onClick={onSave} className={cn("flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium shadow-sm transition-all border border-transparent", theme.primary.DEFAULT, theme.text.inverse, theme.primary.hover)}>
                <Save className="h-3.5 w-3.5"/> Save
            </button>
          )}
      </div>
    </div>
  );
});
