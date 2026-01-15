/**
 * TimeEntryForm Component
 * Form for creating/editing time entries with built-in timer
 * Includes LEDES code support and validation
 */

import { useTheme } from "@/hooks/useTheme";
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
            <p style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>
              Track time in real-time with built-in timer
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUseTimer(!useTimer)}
            style={{
              backgroundColor: useTimer ? theme.primary.DEFAULT : theme.surface.muted,
              borderRadius: tokens.borderRadius.full,
            }}
            className="relative inline-flex h-6 w-11 items-center transition-colors"
          >
            <span
              style={{
                backgroundColor: theme.surface.base,
                borderRadius: tokens.borderRadius.full,
              }}
              className={`inline-block h-4 w-4 transform transition-transform ${useTimer ? 'translate-x-6' : 'translate-x-1'
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
            <label style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.primary,
            }}>
              Case/Matter <span style={{ color: theme.status.error.text }}>*</span>
            </label>
            <select
              name="caseId"
              required
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              style={{
                marginTop: tokens.spacing.normal.xs,
                width: '100%',
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${theme.border.default}`,
                backgroundColor: theme.surface.input,
                padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                color: theme.text.primary,
                boxShadow: tokens.shadows.sm,
              }}
              className="focus:outline-none focus:ring-2"
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
            <label style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.primary,
            }}>
              Date <span style={{ color: theme.status.error.text }}>*</span>
            </label>
            <input
              type="date"
              name="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{
                marginTop: tokens.spacing.normal.xs,
                width: '100%',
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${theme.border.default}`,
                backgroundColor: theme.surface.input,
                padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                color: theme.text.primary,
                boxShadow: tokens.shadows.sm,
              }}
              className="focus:outline-none focus:ring-2"
            />
          </div>
        </div>

        {/* Time and Rate */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Hours */}
          <div>
            <label style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.primary,
            }}>
              Hours <span style={{ color: theme.status.error.text }}>*</span>
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
              style={{
                marginTop: tokens.spacing.normal.xs,
                width: '100%',
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${theme.border.default}`,
                backgroundColor: useTimer ? theme.surface.muted : theme.surface.input,
                padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                color: theme.text.primary,
                boxShadow: tokens.shadows.sm,
                cursor: useTimer ? 'not-allowed' : 'text',
              }}
              className="focus:outline-none focus:ring-2"
            />
            <p style={{
              marginTop: tokens.spacing.normal.xs,
              fontSize: tokens.typography.fontSize.xs,
              color: theme.text.muted,
            }}>Minimum 0.1 (6 minutes)</p>
          </div>

          {/* Rate */}
          <div>
            <label style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.primary,
            }}>
              Rate ($/hr) <span style={{ color: theme.status.error.text }}>*</span>
            </label>
            <input
              type="number"
              name="rate"
              required
              min="0"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              style={{
                marginTop: tokens.spacing.normal.xs,
                width: '100%',
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${theme.border.default}`,
                backgroundColor: theme.surface.input,
                padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                color: theme.text.primary,
                boxShadow: tokens.shadows.sm,
              }}
              className="focus:outline-none focus:ring-2"
            />
          </div>

          {/* Total (calculated) */}
          <div>
            <label style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.primary,
            }}>
              Total
            </label>
            <div style={{
              marginTop: tokens.spacing.normal.xs,
              width: '100%',
              borderRadius: tokens.borderRadius.md,
              border: `1px solid ${theme.border.default}`,
              backgroundColor: theme.surface.muted,
              padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
              color: theme.text.primary,
            }}>
              ${total.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{
            display: 'block',
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: theme.text.primary,
          }}>
            Description <span style={{ color: theme.status.error.text }}>*</span>
          </label>
          <textarea
            name="description"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of work performed..."
            style={{
              marginTop: tokens.spacing.normal.xs,
              width: '100%',
              borderRadius: tokens.borderRadius.md,
              border: `1px solid ${theme.border.default}`,
              backgroundColor: theme.surface.input,
              padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
              color: theme.text.primary,
              boxShadow: tokens.shadows.sm,
            }}
            className="focus:outline-none focus:ring-2"
          />
        </div>

        {/* LEDES and Activity Codes */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* LEDES Task Code */}
          <div>
            <label style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.primary,
            }}>
              LEDES Task Code
            </label>
            <select
              name="taskCode"
              value={taskCode}
              onChange={(e) => setTaskCode(e.target.value)}
              style={{
                marginTop: tokens.spacing.normal.xs,
                width: '100%',
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${theme.border.default}`,
                backgroundColor: theme.surface.input,
                padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                color: theme.text.primary,
                boxShadow: tokens.shadows.sm,
              }}
              className="focus:outline-none focus:ring-2"
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
            <label style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.primary,
            }}>
              Activity Type
            </label>
            <select
              name="activity"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              style={{
                marginTop: tokens.spacing.normal.xs,
                width: '100%',
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${theme.border.default}`,
                backgroundColor: theme.surface.input,
                padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                color: theme.text.primary,
                boxShadow: tokens.shadows.sm,
              }}
              className="focus:outline-none focus:ring-2"
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
              style={{
                height: tokens.spacing.normal.md,
                width: tokens.spacing.normal.md,
                borderRadius: tokens.borderRadius.sm,
                border: `1px solid ${theme.border.default}`,
                accentColor: theme.primary.DEFAULT,
              }}
              className="focus:ring-2"
            />
            <label htmlFor="billable" style={{
              marginLeft: tokens.spacing.normal.sm,
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              color: theme.text.primary,
            }}>
              Billable
            </label>
          </div>

          {/* Status */}
          <div>
            <label style={{
              display: 'block',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.primary,
            }}>
              Status
            </label>
            <select
              name="status"
              defaultValue="Draft"
              style={{
                marginTop: tokens.spacing.normal.xs,
                width: '100%',
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${theme.border.default}`,
                backgroundColor: theme.surface.input,
                padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                color: theme.text.primary,
                boxShadow: tokens.shadows.sm,
              }}
              className="focus:outline-none focus:ring-2"
            >
              <option value="Draft">Draft</option>
              <option value="Submitted">Submit for Approval</option>
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{
          borderTop: `1px solid ${theme.border.default}`,
          paddingTop: tokens.spacing.normal.lg,
        }} className="flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${theme.border.default}`,
                backgroundColor: theme.surface.base,
                padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: theme.text.primary,
                boxShadow: tokens.shadows.sm,
              }}
              className="focus:outline-none focus:ring-2 transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.surface.base}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            style={{
              borderRadius: tokens.borderRadius.md,
              backgroundColor: theme.primary.DEFAULT,
              padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.surface.base,
              boxShadow: tokens.shadows.sm,
            }}
            className="focus:outline-none focus:ring-2 transition-colors"
          >
            {entry ? 'Update' : 'Create'} Time Entry
          </button>
        </div>
      </Form>
    </div>
  );
};
