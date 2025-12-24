/**
 * @module hooks/useHistory
 * @description State-based undo/redo functionality with command pattern
 * 
 * **WHEN TO USE THIS HOOK:**
 * - You need undo/redo for state transformations (immutable state updates)
 * - Your commands operate on React state objects
 * - You want functional, side-effect-free undo operations
 * - Example: Document editor, form history, configuration changes
 * 
 * **WHEN NOT TO USE (use useCommandHistory instead):**
 * - You need undo/redo for imperative operations (DOM manipulation, canvas drawing)
 * - Your commands have side effects on external systems
 * - You're working with workflow/strategy canvas nodes and connections
 * 
 * **PATTERN:**
 * Commands receive and return state: `execute: (state: T) => T`
 * The hook manages state internally and provides current state
 * 
 * @example
 * ```typescript
 * const { state, execute, undo, redo, canUndo, canRedo } = useHistory({
 *   initialState: { text: '' },
 *   maxHistory: 50
 * });
 * 
 * // Execute a state transformation
 * execute({
 *   execute: (state) => ({ ...state, text: 'new value' }),
 *   undo: (state) => ({ ...state, text: 'old value' })
 * });
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface HistoryCommand<T> {
  execute: (state: T) => T;
  undo: (state: T) => T;
  description?: string;
}

export interface UseHistoryOptions<T> {
  initialState: T;
  maxHistory?: number;
  onStateChange?: (state: T) => void;
}

export interface UseHistoryReturn<T> {
  state: T;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  execute: (command: HistoryCommand<T>) => void;
  clear: () => void;
  setState: (newState: T) => void;
}

export function useHistory<T>({
  initialState,
  maxHistory = 50,
  onStateChange
}: UseHistoryOptions<T>): UseHistoryReturn<T> {
  const [state, setStateInternal] = useState<T>(initialState);
  const historyRef = useRef<HistoryCommand<T>[]>([]);
  const currentIndexRef = useRef(-1);

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const setState = useCallback((newState: T) => {
    setStateInternal(newState);
  }, []);

  const execute = useCallback((command: HistoryCommand<T>) => {
    setStateInternal(prevState => {
      const newState = command.execute(prevState);

      // Remove any redo history when new command is executed
      historyRef.current = historyRef.current.slice(0, currentIndexRef.current + 1);

      // Add new command to history
      historyRef.current.push(command);

      // Maintain max history size
      if (historyRef.current.length > maxHistory) {
        historyRef.current.shift();
      } else {
        currentIndexRef.current++;
      }

      return newState;
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    if (currentIndexRef.current >= 0) {
      const command = historyRef.current[currentIndexRef.current];
      setStateInternal(prevState => command.undo(prevState));
      currentIndexRef.current--;
    }
  }, []);

  const redo = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      currentIndexRef.current++;
      const command = historyRef.current[currentIndexRef.current];
      setStateInternal(prevState => command.execute(prevState));
    }
  }, []);

  const clear = useCallback(() => {
    historyRef.current = [];
    currentIndexRef.current = -1;
  }, []);

  const canUndo = currentIndexRef.current >= 0;
  const canRedo = currentIndexRef.current < historyRef.current.length - 1;

  return {
    state,
    canUndo,
    canRedo,
    undo,
    redo,
    execute,
    clear,
    setState
  };
}

/**
 * Factory functions for common text editing commands
 */
export const TextCommands = {
  updateContent: <T extends { content: string }, TState = unknown>(
    id: string,
    newContent: string,
    getSectionById: (state: TState, id: string) => T | undefined,
    updateSection: (state: TState, id: string, updates: Partial<T>) => TState
  ): HistoryCommand<TState> => {
    let oldContent: string;

    return {
      execute: (state) => {
        const section = getSectionById(state, id);
        if (section) {
          oldContent = section.content;
          return updateSection(state, id, { content: newContent } as Partial<T>);
        }
        return state;
      },
      undo: (state) => {
        return updateSection(state, id, { content: oldContent } as Partial<T>);
      },
      description: `Update content for section ${id}`
    };
  }
};
