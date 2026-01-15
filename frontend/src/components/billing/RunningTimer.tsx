/**
 * RunningTimer Component
 * Persistent timer for tracking time entries in real-time
 * Stores state in localStorage to persist across page reloads
 */

import { useTheme } from "@/hooks/useTheme";
import { Clock, Pause, Play, Square } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  const { tokens } = useTheme();
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
    <div className="p-6" style={{
      backgroundColor: tokens.colors.info + '10',
      border: `2px solid ${tokens.colors.borderInfo}`,
      borderRadius: tokens.borderRadius.lg
    }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Clock className="h-8 w-8" style={{ color: tokens.colors.info }} />
          <div>
            <div className="text-3xl font-mono font-bold" style={{ color: tokens.colors.text }}>
              {formattedTime}
            </div>
            <div className="text-sm" style={{ color: tokens.colors.info }}>
              {elapsedHours} hours
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {!timerState.isRunning ? (
            <button
              type="button"
              onClick={startTimer}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2"
              style={{
                backgroundColor: tokens.colors.success,
                color: tokens.colors.textInverse,
                borderRadius: tokens.borderRadius.md,
                boxShadow: tokens.shadows.sm
              }}
            >
              <Play className="h-4 w-4" />
              Start
            </button>
          ) : (
            <button
              type="button"
              onClick={pauseTimer}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2"
              style={{
                backgroundColor: tokens.colors.warning,
                color: tokens.colors.textInverse,
                borderRadius: tokens.borderRadius.md,
                boxShadow: tokens.shadows.sm
              }}
            >
              <Pause className="h-4 w-4" />
              Pause
            </button>
          )}

          <button
            type="button"
            onClick={stopTimer}
            disabled={timerState.elapsedSeconds === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2"
            style={{
              backgroundColor: timerState.elapsedSeconds === 0 ? tokens.colors.disabled : tokens.colors.error,
              color: tokens.colors.textInverse,
              borderRadius: tokens.borderRadius.md,
              boxShadow: tokens.shadows.sm,
              opacity: timerState.elapsedSeconds === 0 ? 0.6 : 1,
              cursor: timerState.elapsedSeconds === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <Square className="h-4 w-4" />
            Stop & Apply
          </button>
        </div>
      </div>

      {timerState.elapsedSeconds > 0 && (
        <div className="mt-4 p-3" style={{
          backgroundColor: tokens.colors.surface + '80',
          borderRadius: tokens.borderRadius.md
        }}>
          <p className="text-sm" style={{ color: tokens.colors.textMuted }}>
            <span className="font-medium">Note:</span> Timer will persist across page reloads. Click "Stop & Apply" to add time to entry.
          </p>
        </div>
      )}
    </div>
  );
};
