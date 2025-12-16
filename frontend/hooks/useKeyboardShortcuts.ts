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
  handlers: KeyboardShortcutHandlers,
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
