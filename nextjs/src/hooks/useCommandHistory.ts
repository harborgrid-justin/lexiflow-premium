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

import {
  Command,
  CommandHistory,
} from "@/services/infrastructure/commandHistory";
import { useCallback, useRef, useState } from "react";

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
  // Use state to track history status to trigger re-renders and avoid reading refs in render
  const [historyState, setHistoryState] = useState({
    canUndo: false,
    canRedo: false,
    undoCount: 0,
    redoCount: 0,
    lastCommand: null as string | null,
  });

  // Force re-render and sync state helper
  const updateState = useCallback(() => {
    setHistoryState({
      canUndo: historyRef.current.canUndo(),
      canRedo: historyRef.current.canRedo(),
      undoCount: historyRef.current.getUndoCount(),
      redoCount: historyRef.current.getRedoCount(),
      lastCommand: historyRef.current.getLastCommandDescription(),
    });
  }, []);

  const execute = useCallback(
    (command: Command) => {
      historyRef.current.execute(command);
      updateState();
    },
    [updateState]
  );

  const undo = useCallback(() => {
    if (historyRef.current.undo()) {
      updateState();
    }
  }, [updateState]);

  const redo = useCallback(() => {
    if (historyRef.current.redo()) {
      updateState();
    }
  }, [updateState]);

  const clear = useCallback(() => {
    historyRef.current.clear();
    updateState();
  }, [updateState]);

  return {
    execute,
    undo,
    redo,
    canUndo: historyState.canUndo,
    canRedo: historyState.canRedo,
    undoCount: historyState.undoCount,
    redoCount: historyState.redoCount,
    clear,
    lastCommand: historyState.lastCommand,
  };
}
