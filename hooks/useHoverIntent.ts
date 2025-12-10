
import { useRef, useCallback, useEffect } from 'react';

interface HoverIntentOptions<T> {
  onHover: (item: T) => void;
  timeout?: number;
}

export const useHoverIntent = <T>({ onHover, timeout = 300 }: HoverIntentOptions<T>) => {
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
