/**
 * @module hooks/useClickOutside
 * @category Hooks - UI Utilities
 * 
 * Detects clicks outside a referenced element and triggers callback.
 * Useful for closing dropdowns, modals, and popovers.
 * 
 * REF USAGE (G45 - Identity, not data flow):
 * - savedHandler: Models IDENTITY of latest callback (not state)
 * - Preserves continuity: event listener uses stable ref, not stale closure
 * 
 * PURE COMPUTATION + EFFECT BOUNDARY (G42):
 * - Pure: contains() check is synchronous
 * - Effect boundary: DOM event listener registration
 * - No render-phase side effects
 * 
 * CONCURRENCY SAFETY (G49, G50):
 * - Idempotent: StrictMode double-invoke cleans up first listener
 * - Render-count independent: No assumptions about render frequency
 * 
 * LIFECYCLE ASSUMPTIONS (G58):
 * - Listener activates: On mount (after ref is assigned)
 * - Listener updates: When ref changes (element identity changes)
 * - Listener deactivates: On unmount (guaranteed cleanup)
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
 * G45 (REF IDENTITY): savedHandler models continuity of callback identity,
 * not data flow. This allows callback logic to change without recreating
 * event listeners.
 * 
 * @param ref - Reference to the element
 * @param handler - Callback when click occurs outside
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  const savedHandler = useRef(handler);

  // G45: Update ref identity when handler changes
  useEffect(() => {
    savedHandler.current = handler;
    // CAUSAL DEPENDENCY (G46): handler changes update ref identity
  }, [handler]);

  // G49/G50: Idempotent, render-count independent
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
    // CAUSAL DEPENDENCY (G46): ref changes require new listener registration
  }, [ref]);
}
