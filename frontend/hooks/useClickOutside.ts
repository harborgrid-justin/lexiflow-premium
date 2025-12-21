/**
 * @module hooks/useClickOutside
 * @category Hooks - UI Utilities
 * @description Detects clicks outside a referenced element and triggers handler callback. Listens
 * for both mouse and touch events. Uses ref callback pattern to keep handler fresh without
 * re-binding listeners.
 * 
 * NO THEME USAGE: Utility hook for click detection logic
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { useEffect, RefObject, useRef } from 'react';

// ========================================
// HOOK
// ========================================
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      savedHandler.current(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref]);
}
