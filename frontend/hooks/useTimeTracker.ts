/**
 * useTimeTracker.ts
 * 
 * Custom hook for time tracking functionality
 * Separates timer logic from presentation
 */

import { useState, useEffect, useCallback } from 'react';
import { DataService } from '../services/data/dataService';
import { TimeEntry, UUID, CaseId, UserId } from '../types';
import { useNotify } from './useNotify';

interface UseTimeTrackerOptions {
  caseId?: string;
  userId?: string;
  rate?: number;
}

export const useTimeTracker = (options: UseTimeTrackerOptions = {}) => {
  const { 
    caseId = 'General', 
    userId = 'current-user', 
    rate = 450 
  } = options;
  
  const notify = useNotify();
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const formatTime = useCallback((totalSeconds: number): string => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const stop = useCallback(async () => {
    if (seconds < 60) {
      setSeconds(0);
      setIsActive(false);
      notify.info("Time entry ignored (less than 1 minute).");
      return;
    }
    
    const durationMinutes = Math.ceil(seconds / 60);
    const entry: TimeEntry = {
      id: `t-${Date.now()}` as UUID,
      caseId: caseId as CaseId,
      userId: userId as UserId,
      date: new Date().toISOString().split('T')[0],
      duration: durationMinutes,
      description: 'General Administrative Task (Auto-Logged)',
      rate,
      total: (durationMinutes / 60) * rate,
      status: 'Unbilled'
    };

    await DataService.billing.addTimeEntry(entry);
    setSeconds(0);
    setIsActive(false);
    notify.success(`Logged ${durationMinutes} minutes to Billing.`);
  }, [seconds, caseId, userId, rate, notify]);

  const reset = useCallback(() => {
    setSeconds(0);
    setIsActive(false);
  }, []);

  return {
    isActive,
    seconds,
    formattedTime: formatTime(seconds),
    start,
    pause,
    stop,
    reset
  };
};
