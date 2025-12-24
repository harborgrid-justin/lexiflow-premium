/**
 * useKeyboardShortcuts.ts
 * 
 * React hook for managing keyboard shortcuts in canvas operations.
 * 
 * @module hooks/useKeyboardShortcuts
 */

import { useEffect, useCallback } from 'react';
import { KEYBOARD_SHORTCUTS } from '@/types/canvas-constants';

export interface KeyboardShortcutHandlers {
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDuplicate?: () => void;
  onSelectAll?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onSave?: () => void;
}

export interface ShortcutConfig {
  key: string;
  cmd?: boolean;
  ctrl?: boolean;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback?: () => void;
  action?: () => void;
  description?: string;
}

/**
 * Check if keyboard shortcut matches
 */
function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  
  const hasCtrl = parts.includes('ctrl');
  const hasShift = parts.includes('shift');
  const hasAlt = parts.includes('alt');

  const ctrlKey = event.ctrlKey || event.metaKey; // Support Mac Cmd key
  
  return (
    event.key.toLowerCase() === key &&
    (!hasCtrl || ctrlKey) &&
    (!hasShift || event.shiftKey) &&
    (!hasAlt || event.altKey) &&
    (hasCtrl === ctrlKey) &&
    (hasShift === event.shiftKey) &&
    (hasAlt === event.altKey)
  );
}

/**
 * Hook for keyboard shortcuts
 */
export function useKeyboardShortcuts(
    handlers: KeyboardShortcutHandlers | Record<string, () => void> | ShortcutConfig[],
    enabled: boolean = true
): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Undo
      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.UNDO) && handlers.onUndo) {
        event.preventDefault();
        handlers.onUndo();
        return;
      }

      // Redo
      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.REDO) && handlers.onRedo) {
        event.preventDefault();
        handlers.onRedo();
        return;
      }

      // Delete
      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        handlers.onDelete &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        event.preventDefault();
        handlers.onDelete();
        return;
      }

      // Copy
      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.COPY) && handlers.onCopy) {
        event.preventDefault();
        handlers.onCopy();
        return;
      }

      // Paste
      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.PASTE) && handlers.onPaste) {
        event.preventDefault();
        handlers.onPaste();
        return;
      }

      // Duplicate
      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.DUPLICATE) && handlers.onDuplicate) {
        event.preventDefault();
        handlers.onDuplicate();
        return;
      }

      // Select All
      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.SELECT_ALL) && handlers.onSelectAll) {
        event.preventDefault();
        handlers.onSelectAll();
        return;
      }

      // Zoom In
      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.ZOOM_IN) && handlers.onZoomIn) {
        event.preventDefault();
        handlers.onZoomIn();
        return;
      }

      // Zoom Out
      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.ZOOM_OUT) && handlers.onZoomOut) {
        event.preventDefault();
        handlers.onZoomOut();
        return;
      }

      // Zoom Reset
      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.ZOOM_RESET) && handlers.onZoomReset) {
        event.preventDefault();
        handlers.onZoomReset();
        return;
      }

      // Save
      if (matchesShortcut(event, KEYBOARD_SHORTCUTS.SAVE) && handlers.onSave) {
        event.preventDefault();
        handlers.onSave();
        return;
      }

      // Handle array-based shortcuts
      if (Array.isArray(handlers)) {
        for (const config of handlers) {
          const modifierMatch =
            (!config.cmd || (event.ctrlKey || event.metaKey)) &&
            (!config.ctrl || event.ctrlKey) &&
            (!config.ctrlOrCmd || (event.ctrlKey || event.metaKey)) &&
            (!config.shift || event.shiftKey) &&
            (!config.alt || event.altKey);

          const keyMatch = event.key.toLowerCase() === config.key.toLowerCase();

          if (modifierMatch && keyMatch) {
            event.preventDefault();
            const handler = config.callback || config.action;
            if (handler) handler();
            return;
          }
        }
      } else {
        // Handle arbitrary string-based shortcuts
        const typedHandlers = handlers as Record<string, () => void>;
        for (const [shortcut, handler] of Object.entries(typedHandlers)) {
          if (typeof handler === 'function' && matchesShortcut(event, shortcut)) {
            event.preventDefault();
            handler();
            return;
          }
        }
      }
    },
    [handlers, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}
