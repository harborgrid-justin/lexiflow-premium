/**
 * @module components/common/ProgressBar
 * @category Common
 * @description Progress bar with percentage display.
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
import { 
  labelContainerStyles, 
  valueStyles, 
  trackStyles, 
  fillStyles, 
  getFillStyle 
} from './ProgressBar.styles';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface ProgressBarProps {
  label: string;
  value: number; // 0-100
  colorClass?: string;
  showValue?: boolean;
}

export function ProgressBar({
  label,
  value,
  colorClass,
  showValue = true
}: ProgressBarProps) {
  const { theme } = useTheme();
  
  return (
    <div>
      <div className={cn(labelContainerStyles, theme.text.secondary)}>
        <span id={"progress-label-"}>{label}</span>
        {showValue && <span className={cn(valueStyles, theme.text.primary)}>{value}%</span>}
      </div>
      <div 
        className={cn(trackStyles, theme.surface.highlight)}
        role="progressbar"
        aria-label={label || `Progress: ${progress}%`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(fillStyles, colorClass || theme.primary.DEFAULT)}
          style={getFillStyle(value)}
        ></div>
      </div>
    </div>
  );
};
