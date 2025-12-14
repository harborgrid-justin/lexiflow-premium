/**
 * @module hooks/useHistory
 * @description Undo/redo functionality with command pattern
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
  updateContent: <T extends { content: string }>(
    id: string,
    newContent: string,
    getSectionById: (state: any, id: string) => T | undefined,
    updateSection: (state: any, id: string, updates: Partial<T>) => any
  ): HistoryCommand<any> => {
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
