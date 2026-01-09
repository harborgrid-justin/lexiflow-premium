'use client';

/**
 * Time Entry Form Component
 *
 * Client-side form for creating time entries with timer functionality.
 */

import { useActionState, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Play, Pause, Square, Save, X, Loader2 } from 'lucide-react';
import { timeEntryFormAction } from '../../actions';
import type { ActionResult } from '../../types';
import { DataService } from '@/services/data/dataService';
import { Case, User } from '@/types';
import { useNotify } from '@/hooks/useNotify';

export function TimeEntryForm() {
  const router = useRouter();
  const { notify } = useNotify();
  const [state, formAction, isPending] = useActionState(
    timeEntryFormAction,
    { success: false } as ActionResult
  );

  // Data state
  const [cases, setCases] = useState<Case[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [manualHours, setManualHours] = useState('');

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCases, fetchedUsers] = await Promise.all([
          DataService.cases.getAll(),
          DataService.users.getAll()
        ]);
        setCases(fetchedCases);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch form data', error);
        notify({ type: 'error', message: 'Failed to load cases or users' });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [notify]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Redirect on success
  useEffect(() => {
    if (state.success && state.redirect) {
      router.push(state.redirect);
    }
  }, [state.success, state.redirect, router]);

  const formatTimerDisplay = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  }, []);

  const timerHours = timerSeconds / 3600;
  const displayHours = isTimerRunning || timerSeconds > 0 ? timerHours : parseFloat(manualHours) || 0;

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    setManualHours('');
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    // Convert timer to manual hours
    setManualHours((timerSeconds / 3600).toFixed(2));
    setTimerSeconds(0);
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="intent" value="create" />

      {/* Timer Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <Clock className="h-5 w-5 text-blue-600" />
          Timer
        </h2>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <div className="font-mono text-4xl font-bold text-slate-900 dark:text-white">
              {formatTimerDisplay(timerSeconds)}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {timerSeconds > 0 ? `${timerHours.toFixed(2)} hours` : 'Use timer or enter manually'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isTimerRunning && timerSeconds === 0 && (
              <button
                type="button"
                onClick={handleStartTimer}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Play className="h-4 w-4" />
                Start Timer
              </button>
            )}
            {isTimerRunning && (
              <button
                type="button"
                onClick={handlePauseTimer}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
              >
                <Pause className="h-4 w-4" />
                Pause
              </button>
            )}
            {!isTimerRunning && timerSeconds > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <Play className="h-4 w-4" />
                  Resume
                </button>
                <button
                  type="button"
                  onClick={handleStopTimer}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Entry Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Entry Details
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Case/Matter */}
          <div>
            <label
              htmlFor="caseId"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Case/Matter *
            </label>
            <select
              id="caseId"
              name="caseId"
              required
              disabled={isLoadingData}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              <option value="">{isLoadingData ? 'Loading cases...' : 'Select a case...'}</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title || c.caseNumber || 'Untitled Case'}
                </option>
              ))}
            </select>
          </div>

          {/* User/Timekeeper */}
          <div>
            <label
              htmlFor="userId"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Timekeeper *
            </label>
            <select
              id="userId"
              name="userId"
              required
              disabled={isLoadingData}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              <option value="">{isLoadingData ? 'Loading users...' : 'Select timekeeper...'}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Hours */}
          <div>
            <label
              htmlFor="hours"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Hours *
            </label>
            <input
              type="number"
              id="hours"
              name="hours"
              step="0.01"
              min="0.01"
              value={timerSeconds > 0 ? timerHours.toFixed(2) : manualHours}
              onChange={(e) => {
                if (timerSeconds === 0) {
                  setManualHours(e.target.value);
                }
              }}
              required
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Hourly Rate */}
          <div>
            <label
              htmlFor="rate"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Hourly Rate *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                id="rate"
                name="rate"
                step="0.01"
                min="0"
                defaultValue="350.00"
                required
                className="w-full rounded-lg border border-slate-300 py-2 pl-8 pr-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          {/* Billable Toggle */}
          <div className="flex items-center">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="billable"
                value="true"
                defaultChecked
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Billable Time
              </span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            placeholder="Describe the work performed..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
        </div>

        {/* Activity Type */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="activityType"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Activity Type
            </label>
            <select
              id="activityType"
              name="activityType"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              <option value="">Select activity...</option>
              <option value="Research">Research</option>
              <option value="Document Review">Document Review</option>
              <option value="Drafting">Drafting</option>
              <option value="Court Appearance">Court Appearance</option>
              <option value="Client Communication">Client Communication</option>
              <option value="Meeting">Meeting</option>
              <option value="Deposition">Deposition</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Travel">Travel</option>
              <option value="Administrative">Administrative</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="taskCode"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Task Code (LEDES)
            </label>
            <input
              type="text"
              id="taskCode"
              name="taskCode"
              placeholder="e.g., A101"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>

        {/* Internal Notes */}
        <div className="mt-4">
          <label
            htmlFor="internalNotes"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Internal Notes
          </label>
          <textarea
            id="internalNotes"
            name="internalNotes"
            rows={2}
            placeholder="Notes for internal use only (not shown on invoices)..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
        </div>
      </div>

      {/* Summary */}
      {displayHours > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Estimated Total
            </span>
            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
              ${(displayHours * 350).toFixed(2)}
            </span>
          </div>
          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
            {displayHours.toFixed(2)} hours x $350.00/hr
          </p>
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/billing/time')}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || isTimerRunning}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Time Entry
        </button>
      </div>
    </form>
  );
}
