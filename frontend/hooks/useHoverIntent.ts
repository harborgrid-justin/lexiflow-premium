/**
 * @module hooks/useHoverIntent
 * @category Hooks - UI Utilities
 * @description Hover intent hook with configurable timeout delay before triggering onHover callback.
 * Prevents accidental hovers by requiring sustained mouse presence. Returns stable hover handler
 * factory for spreading onto elements.
 * 
 * NO THEME USAGE: Utility hook for hover detection logic
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { useRef, useCallback, useEffect } from 'react';
import { TOOLTIP_DELAY_MS } from '../config/master.config';

// ========================================
// TYPES & INTERFACES
// ========================================
interface HoverIntentOptions<T> {
  onHover: (item: T) => void;
  timeout?: number;
}

// ========================================
// HOOK
// ========================================
export const useHoverIntent = <T>({ onHover, timeout = TOOLTIP_DELAY_MS }: HoverIntentOptions<T>) => {
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
  const hoverHandlers = useCallback((item: T) => ({
      onMouseEnter: () => onMouseEnter(item),
      onMouseLeave: onMouseLeave
  }), [onMouseEnter, onMouseLeave]);
  
  return { hoverHandlers };
};
