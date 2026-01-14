/**
 * @module components/common/RiskMeter
 * @category Common
 * @description Visual risk/strength meter with percentage bar.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic chart colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useCallback } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/theme';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface RiskMeterProps {
  value: number; // 0 to 100
  label?: string;
  type?: 'strength' | 'risk';
}

/**
 * RiskMeter - React 18 optimized with React.memo and useCallback
 */
export const RiskMeter = React.memo<RiskMeterProps>(({ value, label, type = 'strength' }) => {
  const { theme } = useTheme();

  const getColor = useCallback((val: number) => {
    if (type === 'strength') {
      if (val >= 80) return theme.chart.colors.success; // Green
      if (val >= 50) return theme.chart.colors.primary; // Blue
      return theme.chart.colors.warning; // Amber
    } else { // Risk
      if (val >= 80) return theme.chart.colors.danger; // Red
      if (val >= 50) return theme.chart.colors.warning; // Amber
      return theme.chart.colors.success; // Green (Low risk is good)
    }
  }, [type, theme]);

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className={cn("font-semibold uppercase", theme.text.secondary)}>{label}</span>
          <span className={cn("font-bold", theme.text.primary)}>{value}%</span>
        </div>
      )}
      <div className={cn("w-full rounded-full h-2 overflow-hidden", theme.surface.highlight)}>
        { }
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: getColor(value) }} 
        />
      </div>
    </div>
  );
});
