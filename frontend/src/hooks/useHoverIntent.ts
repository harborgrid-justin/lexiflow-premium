/**
 * @module hooks/useHoverIntent
 * @category Hooks - UI Utilities
 *
 * Provides hover intent detection with configurable delay.
 * Prevents accidental hovers by requiring sustained mouse presence.
 *
 * TEMPORAL COHERENCE (G41):
 * - Encodes delay-based hover temporal assumption: callback fires after sustained hover
 * - Timer resets on each mouse enter, creating sliding window behavior
 * - Identity: timer ref persists across renders
 *
 * LIFECYCLE ASSUMPTIONS (G58):
 * - Hover intent triggers: After `timeout` ms of sustained hover
 * - Intent resets: On mouse leave or new mouse enter
 * - Timer persists: Until cleared by mouse leave or unmount
 * - Cleanup guarantee: Timer cleared on unmount
 *
 * REF USAGE (G45 - Identity, not data flow):
 * - timer: Models IDENTITY of pending timeout (continuity)
 * - onHoverRef: Models IDENTITY of latest callback (stable reference)
 * - NOT for state: Refs track operation identity, not data flow
 *
 * PURE COMPUTATION + EFFECT BOUNDARY (G42):
 * - Pure: No synchronous derivations in this hook
 * - Effect boundary: setTimeout, event handler registration
 *
 * SEMANTIC MEMOIZATION (G53):
 * - useCallback ensures handlers are referentially stable
 * - Semantic intent: Prevents parent re-renders from resetting timers
 * - NOT for micro-optimization: Critical for timer identity preservation
 *
 * CONCURRENCY SAFETY (G49, G50):
 * - Idempotent: Effect cleanup prevents multiple timers
 * - Render-count independent: Timer in ref, not render-dependent
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
  // G45 (REF IDENTITY): Model timer identity, not data flow
  const timer = useRef<number | null>(null);
  const onHoverRef = useRef(onHover);

  // G45: Keep callback ref fresh without re-binding handlers
  useEffect(() => {
    onHoverRef.current = onHover;
    // CAUSAL DEPENDENCIES (G46): onHover changes update ref identity
  }, [onHover]);

  // G53 (SEMANTIC MEMOIZATION): Stable reference for cleanup logic
  const clearTimer = useCallback(() => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    // EMPTY DEPS (G46): Pure operation using ref
  }, []);

  // G53: Memoized for semantic stability, prevents timer reset on parent render
  const onMouseEnter = useCallback((item: T) => {
    clearTimer(); // Safety clear: prevents multiple timers
    timer.current = window.setTimeout(() => {
      onHoverRef.current(item); // G45: Uses ref for latest callback
    }, timeout);
    // CAUSAL DEPENDENCIES (G46):
    // - timeout: Changes trigger new timer duration
    // - clearTimer: Stable reference via useCallback
  }, [timeout, clearTimer]);

  const onMouseLeave = useCallback(() => {
    clearTimer();
    // CAUSAL DEPENDENCIES (G46): clearTimer stable reference
  }, [clearTimer]);

  // G49 (IDEMPOTENCY): Cleanup prevents orphaned timers in StrictMode
  useEffect(() => {
      return () => clearTimer();
      // CAUSAL DEPENDENCIES (G46): clearTimer for unmount cleanup
  }, [clearTimer]);

  // Return a stable function factory to be spread onto the element
  return { onMouseEnter, onMouseLeave };
}
