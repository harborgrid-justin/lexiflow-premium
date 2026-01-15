/**
 * TimeEntryForm Component
 * Form for creating/editing time entries with built-in timer
 * Includes LEDES code support and validation
 */

import { useTheme } from '@/theme';
import type { TimeEntry } from '@/types/financial';
import React, { useState } from 'react';
import { Form } from 'react-router';
import { RunningTimer } from './RunningTimer';

interface TimeEntryFormProps {
  entry?: Partial<TimeEntry>;
  onCancel?: () => void;
  actionError?: string;
}

export const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  entry,
  onCancel,
  actionError,
}) => {
  const { theme, tokens } = useTheme();
  const [useTimer, setUseTimer] = useState(false);
  const [hours, setHours] = useState(entry?.duration || 0);
  const [selectedCase, setSelectedCase] = useState(entry?.caseId || '');
  const [date, setDate] = useState(entry?.date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(entry?.description || '');
  const [billable, setBillable] = useState(entry?.billable ?? true);
  const [rate, setRate] = useState(entry?.rate || 450);
  const [taskCode, setTaskCode] = useState(entry?.taskCode || '');
  const [activityType, setActivityType] = useState(entry?.activity || '');

  // LEDES activity codes
  const LEDES_CODES = [
    { code: 'L100', name: 'Case Assessment, Development and Administration' },
    { code: 'L110', name: 'Factual Investigation' },
    { code: 'L200', name: 'Legal Research' },
    { code: 'L300', name: 'Document/File Management' },
    { code: 'L400', name: 'Court Appearances' },
    { code: 'L500', name: 'Depositions and Testimony' },
    { code: 'L600', name: 'Experts' },
    { code: 'A100', name: 'Administrative' },
  ];

  const ACTIVITY_TYPES = [
    'Research',
    'Drafting',
    'Court Appearance',
    'Client Meeting',
    'Deposition',
    'Discovery',
    'Negotiation',
    'Phone Call',
    'Email',
    'Review',
    'Other',
  ];

  const handleTimerComplete = (elapsedHours: number) => {
    setHours(elapsedHours);
    setUseTimer(false);
  };

  const total = hours * rate;

  return (
    <div className="max-w-4xl">
      <Form method="post" className="space-y-6">
        {/* Error Message */}
        {actionError && (
          <div style={{ backgroundColor: theme.status.error.bg, borderColor: theme.status.error.border, borderRadius: tokens.borderRadius.md, padding: tokens.spacing.normal.md, borderWidth: '1px' }}>
            <p style={{ fontSize: tokens.typography.fontSize.sm, color: theme.status.error.text }}>{actionError}</p>
          </div>
        )}

        {/* Timer Toggle */}
        <div className="flex items-center justify-between" style={{ borderRadius: tokens.borderRadius.lg, borderWidth: '1px', borderColor: theme.border.default, backgroundColor: theme.surface.raised, padding: tokens.spacing.normal.md }}>
          <div>
            <h3 style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: theme.text.primary }}>
              Use Timer
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track time in real-time with built-in timer
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUseTimer(!useTimer)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useTimer ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useTimer ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        {/* Running Timer */}
        {useTimer && (
          <RunningTimer
            onComplete={handleTimerComplete}
            caseId={selectedCase}
            description={description}
          />
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Case Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Case/Matter <span className="text-red-500">*</span>
            </label>
            <select
              name="caseId"
              required
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">Select a case...</option>
              <option value="C-2024-001">Martinez v. TechCorp</option>
              <option value="C-2024-112">OmniGlobal Merger</option>
              <option value="C-2023-892">StartUp Inc - Series A</option>
            </select>
          </div>

          {/* User (hidden, would come from auth) */}
          <input type="hidden" name="userId" value="usr-admin-justin" />

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Time and Rate */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Hours <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="hours"
              required
              min="0.1"
              step="0.1"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
              disabled={useTimer}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500">Minimum 0.1 (6 minutes)</p>
          </div>

          {/* Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Rate ($/hr) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="rate"
              required
              min="0"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Total (calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Total
            </label>
            <div className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
              ${total.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of work performed..."
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        {/* LEDES and Activity Codes */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* LEDES Task Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              LEDES Task Code
            </label>
            <select
              name="taskCode"
              value={taskCode}
              onChange={(e) => setTaskCode(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">Select LEDES code...</option>
              {LEDES_CODES.map((code) => (
                <option key={code.code} value={code.code}>
                  {code.code} - {code.name}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Activity Type
            </label>
            <select
              name="activity"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">Select activity...</option>
              {ACTIVITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Billable and Status */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Billable */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="billable"
              id="billable"
              checked={billable}
              onChange={(e) => setBillable(e.target.checked)}
              value="true"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="billable" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
              Billable
            </label>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              name="status"
              defaultValue="Draft"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="Draft">Draft</option>
              <option value="Submitted">Submit for Approval</option>
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {entry ? 'Update' : 'Create'} Time Entry
          </button>
        </div>
      </Form>
    </div>
  );
};
