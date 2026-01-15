/**
 * @module components/common/ChartHelpers
 * @category Common
 * @description Chart theme helpers for recharts.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to provide chart colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useMemo } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/ThemeContext';

// ============================================================================
// HOOKS
// ============================================================================
export const useChartTheme = () => {
  const { theme } = useTheme();

  return useMemo(() => ({
    grid: theme.chart.grid,
    text: theme.chart.text,
    colors: theme.chart.colors,
    tooltipStyle: {
        backgroundColor: theme.chart.tooltip.bg,
        borderColor: theme.chart.tooltip.border,
        color: theme.chart.tooltip.text,
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        borderWidth: '1px'
    }
  }), [theme]);
};
