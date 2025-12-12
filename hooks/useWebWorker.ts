/**
 * useWebWorker.ts
 * Web Worker hook for offloading heavy computations to background threads
 * Prevents UI blocking and improves perceived performance
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface WebWorkerOptions {
  timeout?: number;
  autoTerminate?: boolean;
}

export interface WebWorkerResult<T> {
  data: T | null;
  isRunning: boolean;
  error: Error | null;
  run: (...args: any[]) => void;
  terminate: () => void;
}

export type WorkerFunction<T = any, TArgs extends any[] = any[]> = (...args: TArgs) => T;

// ============================================================================
// Worker Status
// ============================================================================

export enum WorkerStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  SUCCESS = 'success',
  ERROR = 'error',
  TIMEOUT = 'timeout',
}

// ============================================================================
// Create Worker from Function
// ============================================================================

function createWorkerFromFunction<T, TArgs extends any[]>(
  fn: WorkerFunction<T, TArgs>
): Worker {
  const fnString = fn.toString();
  const workerScript = `
    self.onmessage = function(e) {
      const fn = ${fnString};
      try {
        const result = fn.apply(null, e.data);
        self.postMessage({ type: 'success', data: result });
      } catch (error) {
        self.postMessage({
          type: 'error',
          error: error.message || 'Worker execution failed'
        });
      }
    };
  `;

  const blob = new Blob([workerScript], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);

  return new Worker(workerUrl);
}

// ============================================================================
// useWebWorker Hook
// ============================================================================

export function useWebWorker<T = any, TArgs extends any[] = any[]>(
  workerFunction: WorkerFunction<T, TArgs>,
  options: WebWorkerOptions = {}
): WebWorkerResult<T> {
  const { timeout = 30000, autoTerminate = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  // ============================================================================
  // Create Worker
  // ============================================================================

  const createWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    try {
      workerRef.current = createWorkerFromFunction(workerFunction);
    } catch (err) {
      console.error('Failed to create worker:', err);
      setError(err instanceof Error ? err : new Error('Failed to create worker'));
    }
  }, [workerFunction]);

  // ============================================================================
  // Terminate Worker
  // ============================================================================

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsRunning(false);
  }, []);

  // ============================================================================
  // Run Worker
  // ============================================================================

  const run = useCallback(
    (...args: TArgs) => {
      if (!workerRef.current) {
        createWorker();
      }

      if (!workerRef.current) {
        setError(new Error('Worker not available'));
        return;
      }

      setIsRunning(true);
      setError(null);
      setData(null);

      // Set timeout
      if (timeout > 0) {
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setError(new Error('Worker timeout exceeded'));
            setIsRunning(false);
            terminate();
          }
        }, timeout);
      }

      // Handle worker messages
      workerRef.current.onmessage = (e: MessageEvent) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        if (!isMountedRef.current) return;

        const { type, data: resultData, error: errorMessage } = e.data;

        if (type === 'success') {
          setData(resultData);
          setIsRunning(false);

          if (autoTerminate) {
            terminate();
          }
        } else if (type === 'error') {
          setError(new Error(errorMessage));
          setIsRunning(false);

          if (autoTerminate) {
            terminate();
          }
        }
      };

      // Handle worker errors
      workerRef.current.onerror = (e: ErrorEvent) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        if (isMountedRef.current) {
          setError(new Error(e.message || 'Worker error'));
          setIsRunning(false);

          if (autoTerminate) {
            terminate();
          }
        }
      };

      // Post message to worker
      workerRef.current.postMessage(args);
    },
    [createWorker, timeout, autoTerminate, terminate]
  );

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      terminate();
    };
  }, [terminate]);

  return {
    data,
    isRunning,
    error,
    run,
    terminate,
  };
}

// ============================================================================
// useWorkerPool Hook (for parallel processing)
// ============================================================================

export interface WorkerPoolOptions extends WebWorkerOptions {
  maxWorkers?: number;
}

export function useWorkerPool<T = any, TArgs extends any[] = any[]>(
  workerFunction: WorkerFunction<T, TArgs>,
  options: WorkerPoolOptions = {}
) {
  const { maxWorkers = navigator.hardwareConcurrency || 4, ...workerOptions } = options;

  const [results, setResults] = useState<T[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const workersRef = useRef<Worker[]>([]);
  const pendingTasksRef = useRef<TArgs[]>([]);
  const completedRef = useRef(0);
  const totalRef = useRef(0);

  // ============================================================================
  // Process Queue
  // ============================================================================

  const processQueue = useCallback(() => {
    if (pendingTasksRef.current.length === 0) {
      setIsRunning(false);
      return;
    }

    const availableWorkers = maxWorkers - workersRef.current.length;

    for (let i = 0; i < availableWorkers && pendingTasksRef.current.length > 0; i++) {
      const args = pendingTasksRef.current.shift()!;
      const worker = createWorkerFromFunction(workerFunction);

      workersRef.current.push(worker);

      worker.onmessage = (e: MessageEvent) => {
        const { type, data } = e.data;

        if (type === 'success') {
          setResults(prev => [...prev, data]);
          completedRef.current++;
          setProgress((completedRef.current / totalRef.current) * 100);
        } else if (type === 'error') {
          setError(new Error(e.data.error));
        }

        // Remove worker and process next task
        workersRef.current = workersRef.current.filter(w => w !== worker);
        worker.terminate();
        processQueue();
      };

      worker.onerror = (e: ErrorEvent) => {
        setError(new Error(e.message));
        workersRef.current = workersRef.current.filter(w => w !== worker);
        worker.terminate();
        processQueue();
      };

      worker.postMessage(args);
    }
  }, [workerFunction, maxWorkers]);

  // ============================================================================
  // Run Parallel Tasks
  // ============================================================================

  const runParallel = useCallback(
    (tasks: TArgs[]) => {
      setIsRunning(true);
      setResults([]);
      setError(null);
      setProgress(0);

      pendingTasksRef.current = [...tasks];
      completedRef.current = 0;
      totalRef.current = tasks.length;

      processQueue();
    },
    [processQueue]
  );

  // ============================================================================
  // Terminate All Workers
  // ============================================================================

  const terminateAll = useCallback(() => {
    workersRef.current.forEach(worker => worker.terminate());
    workersRef.current = [];
    pendingTasksRef.current = [];
    setIsRunning(false);
  }, []);

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      terminateAll();
    };
  }, [terminateAll]);

  return {
    results,
    isRunning,
    error,
    progress,
    runParallel,
    terminateAll,
  };
}

// ============================================================================
// Predefined Worker Functions
// ============================================================================

// Sort large arrays
export const sortWorker = (arr: number[]): number[] => {
  return arr.sort((a, b) => a - b);
};

// Process large datasets
export const filterWorker = <T>(arr: T[], predicate: (item: T) => boolean): T[] => {
  return arr.filter(predicate);
};

// Heavy computation example
export const fibonacciWorker = (n: number): number => {
  if (n <= 1) return n;
  return fibonacciWorker(n - 1) + fibonacciWorker(n - 2);
};

// Parse large JSON
export const jsonParseWorker = (jsonString: string): any => {
  return JSON.parse(jsonString);
};

export default useWebWorker;
