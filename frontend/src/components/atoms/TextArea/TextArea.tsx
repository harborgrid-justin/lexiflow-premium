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
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';
import { labelStyles, getTextAreaStyles } from './TextArea.styles';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => {
  const { theme } = useTheme();
  
  return (
    <div className="w-full">
      {label && <label className={labelStyles(theme)}>{label}</label>}
      <textarea
        className={cn(
          getTextAreaStyles(theme),
          className
        )}
        {...props}
      />
    </div>
  );
};
