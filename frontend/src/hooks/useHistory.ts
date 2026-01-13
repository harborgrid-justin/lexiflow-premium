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
 * TEMPORAL COHERENCE (G41):
 * - Encodes command-based temporal assumption: state changes form a linear history
 * - Identity: historyRef/currentIndexRef track position in timeline
 * - Lifecycle: History persists across renders, bounded by maxHistory
 *
 * REF USAGE (G45 - Identity, not data flow):
 * - historyRef: Models IDENTITY of command sequence (timeline continuity)
 * - currentIndexRef: Models IDENTITY of position in timeline
 * - NOT state: These track history identity, not current data
 *
 * LIFECYCLE ASSUMPTIONS (G58):
 * - History starts: Empty on mount
 * - History grows: On each execute() call
 * - History prunes: When exceeding maxHistory (FIFO)
 * - History resets: On clear() or when executing after undo (branch pruning)
 * - State persists: Until next execute/undo/redo
 *
 * PURE COMPUTATION + EFFECT BOUNDARY (G42):
 * - Pure: Command.execute/undo transformations are synchronous
 * - Effect boundary: onStateChange callback
 * - No render-phase side effects
 *
 * DATA-ORIENTED RETURNS (G44):
 * - Returns STATE (state, canUndo, canRedo) + actions (execute, undo, redo)
 * - Declarative: Consumers query history capability
 *
 * CONCURRENCY SAFETY (G49, G50):
 * - Idempotent: Functional state updates via setStateInternal
 * - Render-count independent: History in refs, not render-dependent
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

import { useCallback, useEffect, useRef, useState } from "react";

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
  onStateChange,
}: UseHistoryOptions<T>): UseHistoryReturn<T> {
  const [state, setStateInternal] = useState<T>(initialState);
  
  // G45 (REF IDENTITY): Model timeline continuity, not data flow
  const historyRef = useRef<HistoryCommand<T>[]>([]);       // Command timeline
  const currentIndexRef = useRef(-1);                        // Position in timeline

  useEffect(() => {
    onStateChange?.(state);
    // CAUSAL DEPENDENCIES (G46):
    // - state: Changes trigger callback
    // - onStateChange: Callback identity changes
  }, [state, onStateChange]);

  // G53 (SEMANTIC MEMOIZATION): Stable reference for prop passing
  const setState = useCallback((newState: T) => {
    setStateInternal(newState);
  }, []);

  const execute = useCallback(
    (command: HistoryCommand<T>) => {
      setStateInternal((prevState) => {
        const newState = command.execute(prevState);

        // G58 (LIFECYCLE): Prune future history on new command (branch pruning)
        historyRef.current = historyRef.current.slice(
          0,
          currentIndexRef.current + 1
        );

        // Add new command to history
        historyRef.current.push(command);

        // G58 (LIFECYCLE): Maintain maxHistory bound (FIFO eviction)
        if (historyRef.current.length > maxHistory) {
          historyRef.current.shift();
        } else {
          currentIndexRef.current++;
        }

        return newState;
      });
    },
    // CAUSAL DEPENDENCIES (G46): maxHistory changes affect pruning logic
    [maxHistory]
  );

  // G53 (SEMANTIC MEMOIZATION): Stable callbacks for prop passing
  const undo = useCallback(() => {
    // G54 (FAIL-FAST): Boundary check before accessing history
    if (currentIndexRef.current >= 0) {
      const command = historyRef.current[currentIndexRef.current];
      if (command) {
        setStateInternal((prevState) => command.undo(prevState));
        currentIndexRef.current--;
      }
    }
    // EMPTY DEPS (G46): Uses refs only, no external dependencies
  }, []);

  const redo = useCallback(() => {
    // G54 (FAIL-FAST): Boundary check before accessing history
    if (currentIndexRef.current < historyRef.current.length - 1) {
      currentIndexRef.current++;
      const command = historyRef.current[currentIndexRef.current];
      if (command) {
        setStateInternal((prevState) => command.execute(prevState));
      }
    }
    // EMPTY DEPS (G46): Uses refs only, no external dependencies
  }, []);

  const clear = useCallback(() => {
    historyRef.current = [];
    currentIndexRef.current = -1;
    // EMPTY DEPS (G46): Pure operation, no dependencies
  }, []);

  // G42 (PURE COMPUTATION): Synchronous derivations from ref state
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
    setState,
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
          return updateSection(state, id, {
            content: newContent,
          } as Partial<T>);
        }
        return state;
      },
      undo: (state) => {
        return updateSection(state, id, { content: oldContent } as Partial<T>);
      },
      description: `Update content for section ${id}`,
    };
  },
};
