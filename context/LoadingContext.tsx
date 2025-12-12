/**
 * Loading Context
 * Global loading state management for operations, overlays, and progress tracking
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo } from 'react';

export type LoadingType = 'spinner' | 'progress' | 'skeleton' | 'overlay';

export interface LoadingState {
  id: string;
  message?: string;
  progress?: number; // 0-100
  type: LoadingType;
  priority?: number; // Higher priority shows first
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface LoadingContextType {
  // Global loading state
  isLoading: boolean;
  loadingStates: LoadingState[];

  // Start/stop loading
  startLoading: (options?: {
    id?: string;
    message?: string;
    type?: LoadingType;
    priority?: number;
    metadata?: Record<string, any>;
  }) => string;
  stopLoading: (id: string) => void;
  stopAllLoading: () => void;

  // Update loading progress
  updateProgress: (id: string, progress: number) => void;
  updateMessage: (id: string, message: string) => void;

  // Async operation wrapper
  withLoading: <T>(
    operation: () => Promise<T>,
    options?: {
      message?: string;
      type?: LoadingType;
      onError?: (error: Error) => void;
    }
  ) => Promise<T>;

  // Get specific loading states
  getLoadingState: (id: string) => LoadingState | undefined;
  hasLoading: (id?: string) => boolean;

  // Get highest priority loading state (for UI display)
  getPrimaryLoading: () => LoadingState | undefined;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoadingContext = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoadingContext must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
  autoCleanupAfter?: number; // Auto-cleanup stale loading states after N milliseconds
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  autoCleanupAfter = 60000, // 1 minute default
}) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([]);

  // Auto-cleanup stale loading states
  useEffect(() => {
    if (!autoCleanupAfter) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setLoadingStates(prev =>
        prev.filter(state => now - state.timestamp < autoCleanupAfter)
      );
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [autoCleanupAfter]);

  // Start loading
  const startLoading = useCallback((options: {
    id?: string;
    message?: string;
    type?: LoadingType;
    priority?: number;
    metadata?: Record<string, any>;
  } = {}): string => {
    const {
      id = `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      type = 'spinner',
      priority = 0,
      metadata,
    } = options;

    const newState: LoadingState = {
      id,
      message,
      type,
      priority,
      timestamp: Date.now(),
      metadata,
    };

    setLoadingStates(prev => {
      // Remove existing state with same id if exists
      const filtered = prev.filter(state => state.id !== id);
      return [...filtered, newState];
    });

    return id;
  }, []);

  // Stop loading
  const stopLoading = useCallback((id: string) => {
    setLoadingStates(prev => prev.filter(state => state.id !== id));
  }, []);

  // Stop all loading
  const stopAllLoading = useCallback(() => {
    setLoadingStates([]);
  }, []);

  // Update progress
  const updateProgress = useCallback((id: string, progress: number) => {
    setLoadingStates(prev =>
      prev.map(state =>
        state.id === id
          ? { ...state, progress: Math.max(0, Math.min(100, progress)) }
          : state
      )
    );
  }, []);

  // Update message
  const updateMessage = useCallback((id: string, message: string) => {
    setLoadingStates(prev =>
      prev.map(state =>
        state.id === id ? { ...state, message } : state
      )
    );
  }, []);

  // Wrap async operation with loading state
  const withLoading = useCallback(async <T,>(
    operation: () => Promise<T>,
    options: {
      message?: string;
      type?: LoadingType;
      onError?: (error: Error) => void;
    } = {}
  ): Promise<T> => {
    const loadingId = startLoading({
      message: options.message,
      type: options.type,
    });

    try {
      const result = await operation();
      stopLoading(loadingId);
      return result;
    } catch (error) {
      stopLoading(loadingId);
      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
      throw error;
    }
  }, [startLoading, stopLoading]);

  // Get specific loading state
  const getLoadingState = useCallback((id: string): LoadingState | undefined => {
    return loadingStates.find(state => state.id === id);
  }, [loadingStates]);

  // Check if loading (optionally for specific id)
  const hasLoading = useCallback((id?: string): boolean => {
    if (id) {
      return loadingStates.some(state => state.id === id);
    }
    return loadingStates.length > 0;
  }, [loadingStates]);

  // Get primary loading state (highest priority)
  const getPrimaryLoading = useCallback((): LoadingState | undefined => {
    if (loadingStates.length === 0) return undefined;

    return loadingStates.reduce((highest, current) => {
      const highestPriority = highest.priority ?? 0;
      const currentPriority = current.priority ?? 0;
      return currentPriority > highestPriority ? current : highest;
    });
  }, [loadingStates]);

  // Computed global loading state
  const isLoading = loadingStates.length > 0;

  const value = useMemo<LoadingContextType>(() => ({
    isLoading,
    loadingStates,
    startLoading,
    stopLoading,
    stopAllLoading,
    updateProgress,
    updateMessage,
    withLoading,
    getLoadingState,
    hasLoading,
    getPrimaryLoading,
  }), [
    isLoading,
    loadingStates,
    startLoading,
    stopLoading,
    stopAllLoading,
    updateProgress,
    updateMessage,
    withLoading,
    getLoadingState,
    hasLoading,
    getPrimaryLoading,
  ]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;
