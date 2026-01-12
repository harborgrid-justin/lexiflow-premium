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
import { useTheme } from '@/features/theme';
import { DEFAULT_TOKENS } from '@/features/theme';

// ============================================================================
// HOOKS
// ============================================================================
export const useChartTheme = () => {
  useTheme();

  return useMemo(() => ({
    grid: DEFAULT_TOKENS.colors.border,
    text: DEFAULT_TOKENS.colors.textMuted,
    colors: [
      DEFAULT_TOKENS.colors.primary,
      DEFAULT_TOKENS.colors.secondary,
      DEFAULT_TOKENS.colors.accent,
      DEFAULT_TOKENS.colors.success,
      DEFAULT_TOKENS.colors.warning
    ],
    tooltipStyle: {
      backgroundColor: DEFAULT_TOKENS.colors.surface,
      borderColor: DEFAULT_TOKENS.colors.border,
      color: DEFAULT_TOKENS.colors.text,
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      borderWidth: '1px'
    }
  }), []);
};
