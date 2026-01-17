/**
 * @module hooks/useHoverIntent
 * @category Hooks - UI Utilities
 *
 * Provides hover intent detection with configurable delay.
 * Prevents accidental hovers by requiring sustained mouse presence.
 *
 * @example
 * ```typescript
 * const { onMouseEnter, onMouseLeave } = useHoverIntent({
 *   onHover: (item) => setTooltipData(item),
 *   timeout: 500
 * });
 *
 * <div
 *   onMouseEnter={() => onMouseEnter(item)}
 *   onMouseLeave={onMouseLeave}
 * >
 *   Hover me
 * </div>
 * ```
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { useRef, useCallback, useEffect } from 'react';

import { TOOLTIP_DELAY_MS } from '@/config/features/ui.config';

// ========================================
// TYPES & INTERFACES
// ========================================

/**
 * Options for useHoverIntent hook
 */
interface HoverIntentOptions<T> {
  /** Callback when hover intent is detected */
  onHover: (item: T) => void;
  /** Delay in milliseconds before triggering (default: TOOLTIP_DELAY_MS) */
  timeout?: number;
}

/**
 * Return type for useHoverIntent hook
 */
export interface UseHoverIntentReturn<T> {
  /** Handler for mouse enter event */
  onMouseEnter: (item: T) => void;
  /** Handler for mouse leave event */
  onMouseLeave: () => void;
}

// ========================================
// HOOK
// ========================================

/**
 * Manages hover intent with configurable delay.
 *
 * @param options - Configuration options
 * @returns Object with onMouseEnter and onMouseLeave handlers
 */
export function useHoverIntent<T>(
  { onHover, timeout = TOOLTIP_DELAY_MS }: HoverIntentOptions<T>
): UseHoverIntentReturn<T> {
  const timer = useRef<number | null>(null);
  const onHoverRef = useRef(onHover);

  // Keep ref fresh without re-binding handlers
  useEffect(() => {
    onHoverRef.current = onHover;
  }, [onHover]);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const onMouseEnter = useCallback((item: T) => {
    clearTimer(); // Safety clear
    timer.current = window.setTimeout(() => {
      onHoverRef.current(item);
    }, timeout);
  }, [timeout, clearTimer]);

  const onMouseLeave = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  // Clean up on unmount
  useEffect(() => {
      return () => clearTimer();
  }, [clearTimer]);

  // Return a stable function factory to be spread onto the element
  return { onMouseEnter, onMouseLeave };
};
