/**
 * RunningTimer Component
 * Persistent timer for tracking time entries in real-time
 * Stores state in localStorage to persist across page reloads
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Clock, Pause, Play, Square } from 'lucide-react';

interface RunningTimerProps {
  onComplete?: (elapsedHours: number) => void;
  caseId?: string;
  description?: string;
}

interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  elapsedSeconds: number;
  caseId: string;
  description: string;
}

const STORAGE_KEY = 'lexiflow_running_timer';

export const RunningTimer: React.FC<RunningTimerProps> = ({
  onComplete,
  caseId = '',
  description = '',
}) => {
  const [timerState, setTimerState] = useState<TimerState>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Calculate elapsed time if timer was running
        if (parsed.isRunning && parsed.startTime) {
          const now = Date.now();
          const additionalSeconds = Math.floor((now - parsed.startTime) / 1000);
          return {
            ...parsed,
            elapsedSeconds: parsed.elapsedSeconds + additionalSeconds,
            startTime: now,
          };
        }
        return parsed;
      } catch {
        // Invalid saved state
      }
    }
    return {
      isRunning: false,
      startTime: null,
      elapsedSeconds: 0,
      caseId,
      description,
    };
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timerState));
  }, [timerState]);

  // Timer tick
  useEffect(() => {
    if (timerState.isRunning) {
      intervalRef.current = setInterval(() => {
        setTimerState((prev) => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1,
        }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning]);

  const startTimer = () => {
    setTimerState((prev) => ({
      ...prev,
      isRunning: true,
      startTime: Date.now(),
    }));
  };

  const pauseTimer = () => {
    setTimerState((prev) => ({
      ...prev,
      isRunning: false,
      startTime: null,
    }));
  };

  const stopTimer = () => {
    const hours = timerState.elapsedSeconds / 3600;
    if (onComplete) {
      onComplete(parseFloat(hours.toFixed(2)));
    }
    // Clear timer
    setTimerState({
      isRunning: false,
      startTime: null,
      elapsedSeconds: 0,
      caseId,
      description,
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const elapsedHours = useMemo(
    () => (timerState.elapsedSeconds / 3600).toFixed(2),
    [timerState.elapsedSeconds]
  );

  const formattedTime = useMemo(
    () => formatTime(timerState.elapsedSeconds),
    [timerState.elapsedSeconds, formatTime]
  );

  return (
    <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-6 dark:border-blue-400 dark:bg-blue-900/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <div>
            <div className="text-3xl font-mono font-bold text-blue-900 dark:text-blue-100">
              {formattedTime}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {elapsedHours} hours
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {!timerState.isRunning ? (
            <button
              type="button"
              onClick={startTimer}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Play className="h-4 w-4" />
              Start
            </button>
          ) : (
            <button
              type="button"
              onClick={pauseTimer}
              className="flex items-center gap-2 rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              <Pause className="h-4 w-4" />
              Pause
            </button>
          )}

          <button
            type="button"
            onClick={stopTimer}
            disabled={timerState.elapsedSeconds === 0}
            className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Square className="h-4 w-4" />
            Stop & Apply
          </button>
        </div>
      </div>

      {timerState.elapsedSeconds > 0 && (
        <div className="mt-4 rounded-md bg-white/50 p-3 dark:bg-gray-800/50">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Note:</span> Timer will persist across page reloads. Click "Stop & Apply" to add time to entry.
          </p>
        </div>
      )}
    </div>
  );
};
