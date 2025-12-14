/**
 * useCommandHistory.ts
 * 
 * React hook for managing undo/redo operations with keyboard shortcuts.
 * 
 * @module hooks/useCommandHistory
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { CommandHistory, Command } from '../services/commandHistory';

export interface UseCommandHistoryReturn {
  execute: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
  clear: () => void;
  lastCommand: string | null;
}

/**
 * Hook for managing command history with undo/redo
 */
export function useCommandHistory(maxSize?: number): UseCommandHistoryReturn {
  const historyRef = useRef(new CommandHistory(maxSize));
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Force re-render helper
  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  const execute = useCallback((command: Command) => {
    historyRef.current.execute(command);
    forceUpdate();
  }, [forceUpdate]);

  const undo = useCallback(() => {
    if (historyRef.current.undo()) {
      forceUpdate();
    }
  }, [forceUpdate]);

  const redo = useCallback(() => {
    if (historyRef.current.redo()) {
      forceUpdate();
    }
  }, [forceUpdate]);

  const clear = useCallback(() => {
    historyRef.current.clear();
    forceUpdate();
  }, [forceUpdate]);

  return {
    execute,
    undo,
    redo,
    canUndo: historyRef.current.canUndo(),
    canRedo: historyRef.current.canRedo(),
    undoCount: historyRef.current.getUndoCount(),
    redoCount: historyRef.current.getRedoCount(),
    clear,
    lastCommand: historyRef.current.getLastCommandDescription(),
  };
}
