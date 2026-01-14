/**
 * useTimeTracker Hook
 * @module hooks/useTimeTracker
 * @description Enterprise-grade time tracking hook with timer states, billing codes, and backend sync
 * @status PRODUCTION READY
 */

import { billingApi } from '@/lib/frontend-api';
import { useMutation } from "@/hooks/backend";
import { showToast } from "@/shared/ui/organisms/notifications/Toast";
import { useCallback, useEffect, useRef, useState } from "react";

export interface TimeTrackerState {
  isActive: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  caseId: string | null;
  description: string;
}

export const useTimeTracker = (initialCaseId?: string) => {
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [caseId, setCaseId] = useState<string | null>(initialCaseId || null);
  const [description, setDescription] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load active timer from local storage on mount (persistence)
  useEffect(() => {
    const savedTimer = localStorage.getItem("lexiflow_active_timer");
    if (savedTimer) {
      const parsed = JSON.parse(savedTimer);
      if (parsed.isActive) {
        setStartTime(new Date(parsed.startTime));
        setCaseId(parsed.caseId);
        setDescription(parsed.description);
        setIsActive(true);

        // Calculate verified elapsed time
        const now = new Date();
        const start = new Date(parsed.startTime);
        setElapsedSeconds(Math.floor((now.getTime() - start.getTime()) / 1000));
      }
    }
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);

        // Auto-save state every minute
        localStorage.setItem(
          "lexiflow_active_timer",
          JSON.stringify({
            isActive: true,
            startTime,
            caseId,
            description,
            lastUpdated: new Date(),
          })
        );
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, startTime, caseId, description]);

  const startTimer = useCallback(
    (selectedCaseId?: string, taskDescription?: string) => {
      if (isActive) {
        showToast({
          type: "warning",
          title: "Timer Active",
          message: "A timer is already running. Please stop it first.",
        });
        return;
      }

      const now = new Date();
      setStartTime(now);
      setElapsedSeconds(0);
      setIsActive(true);
      if (selectedCaseId) setCaseId(selectedCaseId);
      if (taskDescription) setDescription(taskDescription);

      // Persist
      localStorage.setItem(
        "lexiflow_active_timer",
        JSON.stringify({
          isActive: true,
          startTime: now,
          caseId: selectedCaseId || caseId,
          description: taskDescription || description,
        })
      );

      showToast({
        type: "success",
        title: "Timer Started",
        message: "Timer started",
      });
    },
    [isActive, caseId, description]
  );

  const pauseTimer = useCallback(() => {
    if (!isActive) return;
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    showToast({ type: "info", title: "Timer Paused", message: "Timer paused" });
  }, [isActive]);

  const stopTimer = useCallback(async () => {
    if (!isActive && elapsedSeconds === 0) return;

    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // Clear persistence
    localStorage.removeItem("lexiflow_active_timer");

    return {
      startTime,
      endTime: new Date(),
      duration: elapsedSeconds,
      caseId,
      description,
    };
  }, [isActive, elapsedSeconds, startTime, caseId, description]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setStartTime(null);
    setElapsedSeconds(0);
    setDescription("");
    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.removeItem("lexiflow_active_timer");
  }, []);

  const createEntryMutation = useMutation(
    (entry: {
      caseId: string;
      description: string;
      date: string;
      hours: number;
      isBillable: boolean;
      rate: number;
    }) => billingApi.timeEntries.create({ ...entry, userId: 'current', billable: entry.isBillable }),
    {
      onSuccess: () => {
        billingApi.timeEntries.getAll().then(() => {}); // pseudo-invalidation
        showToast({
          type: "success",
          title: "Success",
          message: "Time entry saved successfully",
        });
        resetTimer();
      },
      onError: () => {
        showToast({
          type: "error",
          title: "Error",
          message: "Failed to save time entry",
        });
        // Don't reset timer on error so user doesn't lose data
      },
    }
  );

  const saveEntry = useCallback(async () => {
    const timerData = await stopTimer();
    if (!timerData) return;

    if (!caseId) {
      showToast({
        type: "warning",
        title: "Missing Information",
        message: "Please select a case/matter before saving",
      });
      return;
    }

    createEntryMutation.mutate({
      caseId,
      description: description || "Billable work",
      date: timerData.startTime?.toISOString() || new Date().toISOString(),
      hours: Number((timerData.duration / 3600).toFixed(2)),
      isBillable: true,
      rate: 0, // Will be calculated by backend based on fee agreement
    });
  }, [stopTimer, caseId, description, createEntryMutation]);

  return {
    isActive,
    startTime,
    elapsedSeconds,
    formattedTime: new Date(elapsedSeconds * 1000).toISOString().substr(11, 8),
    caseId,
    description,
    setCaseId,
    setDescription,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    saveEntry,
    isSaving: createEntryMutation.isLoading,
  };
};
