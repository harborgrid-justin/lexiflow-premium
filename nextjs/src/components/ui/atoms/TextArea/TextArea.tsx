/**
 * @module components/atoms/TextArea
 * @category Atoms
 * @description TextArea component with theme support.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useId } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers';

// Utils & Constants
import { cn } from '@/utils/cn';
import { labelStyles, getTextAreaStyles } from './TextArea.styles';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * TextArea - React 18 optimized textarea component
 * Uses useId for SSR-safe unique IDs
 */
export function TextArea({ label, className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const { theme } = useTheme();
  const textareaId = useId();
  
  return (
    <div className="w-full">
      {label && <label htmlFor={textareaId} className={labelStyles(theme)}>{label}</label>}
      <textarea
        id={textareaId}
        aria-label={label || props['aria-label']}
        className={cn(
          getTextAreaStyles(theme),
          className
        )}
        {...props}
      />
    </div>
  );
}
