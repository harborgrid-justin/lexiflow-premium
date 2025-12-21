/**
 * useCommandHistory.ts
 * 
 * React hook for imperative command pattern with undo/redo operations.
 * 
 * **WHEN TO USE THIS HOOK:**
 * - You need undo/redo for imperative operations with side effects
 * - Your commands manipulate external state (canvas nodes, DOM, services)
 * - You're working with workflow/strategy canvas components
 * - You need command descriptions and operation counts
 * - Example: Canvas operations, graph manipulation, visual editor actions
 * 
 * **WHEN NOT TO USE (use useHistory instead):**
 * - You need undo/redo for pure React state transformations
 * - Your operations are functional and side-effect-free
 * - You want the hook to manage state for you
 * 
 * **PATTERN:**
 * Commands are imperative with side effects: `execute(): void, undo(): void`
 * The hook tracks command history but doesn't manage application state
 * Commands directly mutate external state when executed/undone
 * 
 * @example
 * ```typescript
 * const { execute, undo, redo, canUndo, canRedo } = useCommandHistory();
 * 
 * // Execute an imperative command
 * const command = new AddNodeCommand(nodeId, nodeData, canvas);
 * execute(command); // Directly adds node to canvas
 * 
 * undo(); // Command.undo() removes node from canvas
 * ```
 * 
 * @module hooks/useCommandHistory
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { CommandHistory, Command } from '../services/infrastructure/commandHistory';

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

