
import { useRef, useCallback } from 'react';

interface HoverIntentOptions<T> {
  onHover: (item: T) => void;
  timeout?: number;
}

export const useHoverIntent = <T>({ onHover, timeout = 200 }: HoverIntentOptions<T>) => {
  const timer = useRef<number | null>(null);
  const onHoverRef = useRef(onHover);
  onHoverRef.current = onHover;

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const onMouseEnter = useCallback((item: T) => {
    clearTimer();
    timer.current = window.setTimeout(() => {
      onHoverRef.current(item);
    }, timeout);
  }, [timeout]);

  const onMouseLeave = useCallback(() => {
    clearTimer();
  }, []);

  // Return a single object to be spread onto the element
  const hoverHandlers = (item: T) => ({
      onMouseEnter: () => onMouseEnter(item),
      onMouseLeave: onMouseLeave
  });
  
  return { hoverHandlers };
};
