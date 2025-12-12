/**
 * useKeyPress Hook
 * Detect when a specific key is pressed
 */

import { useEffect, useState, useCallback } from 'react';

export interface UseKeyPressOptions {
  /**
   * Target element to listen for keypress events
   * Defaults to window
   */
  target?: HTMLElement | Window | null;

  /**
   * Event type to listen for
   * Defaults to 'keydown'
   */
  eventType?: 'keydown' | 'keyup' | 'keypress';

  /**
   * Callback when key is pressed
   */
  onKeyPress?: (event: KeyboardEvent) => void;

  /**
   * Check for modifier keys
   */
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };

  /**
   * Whether the hook is enabled
   */
  enabled?: boolean;
}

/**
 * Hook to detect when a specific key is pressed
 *
 * @example
 * // Simple usage
 * const enterPressed = useKeyPress('Enter');
 *
 * @example
 * // With modifiers
 * const savePressed = useKeyPress('s', {
 *   modifiers: { ctrl: true, meta: true }
 * });
 *
 * @example
 * // With callback
 * useKeyPress('Escape', {
 *   onKeyPress: () => closeModal()
 * });
 */
export function useKeyPress(
  targetKey: string | string[],
  options: UseKeyPressOptions = {}
): boolean {
  const {
    target = typeof window !== 'undefined' ? window : null,
    eventType = 'keydown',
    onKeyPress,
    modifiers = {},
    enabled = true,
  } = options;

  const [keyPressed, setKeyPressed] = useState(false);

  const keys = Array.isArray(targetKey) ? targetKey : [targetKey];

  const downHandler = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if the pressed key matches any of our target keys
      const keyMatch = keys.some(
        key => event.key === key || event.code === key || event.keyCode === key.charCodeAt(0)
      );

      if (!keyMatch) return;

      // Check modifier keys
      const ctrlMatch = modifiers.ctrl === undefined || event.ctrlKey === modifiers.ctrl;
      const shiftMatch = modifiers.shift === undefined || event.shiftKey === modifiers.shift;
      const altMatch = modifiers.alt === undefined || event.altKey === modifiers.alt;
      const metaMatch = modifiers.meta === undefined || event.metaKey === modifiers.meta;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        setKeyPressed(true);
        if (onKeyPress) {
          onKeyPress(event);
        }
      }
    },
    [keys, modifiers, onKeyPress, enabled]
  );

  const upHandler = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const keyMatch = keys.some(
        key => event.key === key || event.code === key || event.keyCode === key.charCodeAt(0)
      );

      if (keyMatch) {
        setKeyPressed(false);
      }
    },
    [keys, enabled]
  );

  useEffect(() => {
    if (!target || !enabled) return;

    const targetElement = target as EventTarget;

    if (eventType === 'keydown' || eventType === 'keypress') {
      targetElement.addEventListener(eventType, downHandler as EventListener);
      targetElement.addEventListener('keyup', upHandler as EventListener);
    } else {
      targetElement.addEventListener('keyup', downHandler as EventListener);
    }

    return () => {
      if (eventType === 'keydown' || eventType === 'keypress') {
        targetElement.removeEventListener(eventType, downHandler as EventListener);
        targetElement.removeEventListener('keyup', upHandler as EventListener);
      } else {
        targetElement.removeEventListener('keyup', downHandler as EventListener);
      }
    };
  }, [target, eventType, downHandler, upHandler, enabled]);

  return keyPressed;
}

export default useKeyPress;
