/**
 * @module components/enterprise/data/InlineEditor
 * @category Enterprise
 * @description Inline cell editor component for DataGrid with support for multiple input types.
 *
 * Supported editor types:
 * - Text input
 * - Number input
 * - Date picker
 * - Select dropdown
 * - Checkbox
 * - Textarea
 *
 * Features:
 * - Auto-focus on mount
 * - Save on Enter key
 * - Cancel on Escape key
 * - Save/Cancel buttons
 * - Click outside to cancel
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/cn';
import { EditorOption, EditorType } from './DataGridColumn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CellEditorProps {
  value: unknown;
  type: EditorType;
  options?: EditorOption[];
  onSave: (value: unknown) => void;
  onCancel: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function InlineEditor({
  value: initialValue,
  type,
  options,
  onSave,
  onCancel,
}: CellEditorProps) {
  const { theme } = useTheme();
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();

      // Select text for text inputs
      if (inputRef.current instanceof HTMLInputElement && type === 'text') {
        inputRef.current.select();
      }
    }
  }, [type]);

  // Handle saving value
  const handleSave = useCallback(() => {
    // Convert value to appropriate type
    let finalValue = value;

    switch (type) {
      case 'number':
        finalValue = value ? parseFloat(String(value)) : null;
        break;
      case 'checkbox':
        finalValue = Boolean(value);
        break;
      case 'date':
        finalValue = value ? new Date(String(value)) : null;
        break;
    }

    onSave(finalValue);
  }, [value, type, onSave]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleSave();
      }
    };

    // Guard browser API access for SSR compatibility
    if (typeof document === 'undefined') return;

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleSave]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  }, [type, handleSave, handleCancel]);

  const renderEditor = () => {
    switch (type) {
      case 'text':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={String(value ?? '')}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full px-2 py-1 text-sm border rounded",
              theme.surface.default,
              theme.border.default,
              theme.text.primary,
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
          />
        );

      case 'number':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="number"
            value={value !== null && value !== undefined ? String(value) : ''}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full px-2 py-1 text-sm border rounded",
              theme.surface.default,
              theme.border.default,
              theme.text.primary,
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
          />
        );

      case 'date':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="date"
            value={value ? formatDateForInput(value) : ''}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full px-2 py-1 text-sm border rounded",
              theme.surface.default,
              theme.border.default,
              theme.text.primary,
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
          />
        );

      case 'select':
        return (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={value !== null && value !== undefined ? String(value) : ''}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full px-2 py-1 text-sm border rounded",
              theme.surface.default,
              theme.border.default,
              theme.text.primary,
              "focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            )}
          >
            <option value="">Select...</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center justify-center">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="checkbox"
              checked={!!value}
              onChange={(e) => setValue(e.target.checked)}
              onKeyDown={handleKeyDown}
              className="w-4 h-4 rounded cursor-pointer"
            />
          </div>
        );

      case 'textarea':
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={String(value ?? '')}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className={cn(
              "w-full px-2 py-1 text-sm border rounded resize-none",
              theme.surface.default,
              theme.border.default,
              theme.text.primary,
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
          />
        );

      default:
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={String(value ?? '')}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full px-2 py-1 text-sm border rounded",
              theme.surface.default,
              theme.border.default,
              theme.text.primary,
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
          />
        );
    }
  };

  return (
    <div ref={containerRef} className="flex items-center gap-1 w-full">
      <div className="flex-1">
        {renderEditor()}
      </div>

      {/* Action Buttons (for textarea and complex editors) */}
      {type === 'textarea' && (
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={handleSave}
            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Save (Enter)"
          >
            <CheckIcon />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Cancel (Esc)"
          >
            <XIcon />
          </button>
        </div>
      )}
    </div>
  );
}

InlineEditor.displayName = 'InlineEditor';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formats a date value for HTML date input
 */
function formatDateForInput(value: unknown): string {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(String(value));

  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// ============================================================================
// ICONS
// ============================================================================

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
