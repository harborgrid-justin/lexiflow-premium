/**
 * RunningTimer Component
 * Persistent timer for tracking time entries in real-time
 * Stores state in localStorage to persist across page reloads
 */

'use client';

import { Clock, Pause, Play, Square } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent } from '@/components/ui/shadcn/card';

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
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
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
    <Card className="bg-muted/30 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <div className="text-3xl font-mono font-bold text-foreground">
                {formattedTime}
              </div>
              <div className="text-sm text-muted-foreground">
                {elapsedHours} hours
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!timerState.isRunning ? (
              <Button
                variant="default"
                onClick={startTimer}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="h-4 w-4" />
                Start
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={pauseTimer}
                className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}

            <Button
              variant="destructive"
              onClick={stopTimer}
              disabled={timerState.elapsedSeconds === 0}
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop & Apply
            </Button>
          </div>
        </div>

        {timerState.elapsedSeconds > 0 && (
          <div className="mt-4 rounded-md bg-background/50 p-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Note:</span> Timer will persist across page reloads. Click "Stop & Apply" to add time to entry.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
