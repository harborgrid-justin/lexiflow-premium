/**
 * @module hooks/useClickOutside
 * @category Hooks - UI Utilities
 * 
 * Detects clicks outside a referenced element and triggers callback.
 * Useful for closing dropdowns, modals, and popovers.
 * 
 * @example
 * ```typescript
 * const dropdownRef = useRef<HTMLDivElement>(null);
 * 
 * useClickOutside(dropdownRef, () => {
 *   setIsOpen(false);
 * });
 * 
 * <div ref={dropdownRef}>Dropdown content</div>
 * ```
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { useEffect, type RefObject, useRef } from 'react';

// ========================================
// HOOK
// ========================================

/**
 * Detects clicks outside a referenced element.
 * 
 * @param ref - Reference to the element
 * @param handler - Callback when click occurs outside
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
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
