/**
 * @module components/billing/TimeEntryWidget
 * @category Billing
 * @description Quick time entry widget for capturing billable time on-the-fly
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect, memo } from 'react';
import { Clock, Play, Pause, Save, X, Calendar, DollarSign } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface TimeEntryWidgetProps {
  /** Optional case/matter ID to pre-populate */
  caseId?: string;
  /** Optional callback when time entry is saved */
  onSave?: (entry: TimeEntryData) => void;
  /** Optional callback when widget is closed */
  onClose?: () => void;
  /** Optional class name */
  className?: string;
}

interface TimeEntryData {
  caseId?: string;
  date: string;
  duration: number;
  description: string;
  activity: string;
  billable: boolean;
}

interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  elapsed: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

const TimeEntryWidgetComponent: React.FC<TimeEntryWidgetProps> = ({
  caseId: initialCaseId,
  onSave,
  onClose,
  className
}) => {
  const { theme } = useTheme();

  // Timer state
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    startTime: null,
    elapsed: 0
  });

  // Form state
  const [formData, setFormData] = useState<TimeEntryData>({
    caseId: initialCaseId,
    date: new Date().toISOString().split('T')[0],
    duration: 0,
    description: '',
    activity: 'General Legal Services',
    billable: true
  });

  // Update elapsed time when timer is running
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timer.isRunning && timer.startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - timer.startTime!) / 1000);
        setTimer(prev => ({ ...prev, elapsed }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning, timer.startTime]);

  // Format elapsed time for display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert seconds to hours (rounded to 0.1)
  const secondsToHours = (seconds: number): number => {
    return Math.round((seconds / 3600) * 10) / 10;
  };

  // Handle timer start/stop
  const toggleTimer = () => {
    if (timer.isRunning) {
      // Stop timer
      setTimer(prev => ({
        isRunning: false,
        startTime: null,
        elapsed: prev.elapsed
      }));

      // Update duration in form
      setFormData(prev => ({
        ...prev,
        duration: secondsToHours(timer.elapsed)
      }));
    } else {
      // Start timer
      setTimer({
        isRunning: true,
        startTime: Date.now(),
        elapsed: timer.elapsed
      });
    }
  };

  // Handle manual duration change
  const handleDurationChange = (value: string) => {
    const duration = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, duration }));

    // Stop timer if running
    if (timer.isRunning) {
      setTimer({ isRunning: false, startTime: null, elapsed: 0 });
    }
  };

  // Handle save
  const handleSave = () => {
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    if (formData.duration <= 0) {
      alert('Duration must be greater than 0');
      return;
    }

    // If timer is running, stop it and use elapsed time
    if (timer.isRunning) {
      const finalDuration = secondsToHours(timer.elapsed);
      const finalData = { ...formData, duration: finalDuration };
      onSave?.(finalData);
    } else {
      onSave?.(formData);
    }

    // Reset form
    setFormData({
      caseId: initialCaseId,
      date: new Date().toISOString().split('T')[0],
      duration: 0,
      description: '',
      activity: 'General Legal Services',
      billable: true
    });
    setTimer({ isRunning: false, startTime: null, elapsed: 0 });
  };

  const activities = [
    'General Legal Services',
    'Client Meeting',
    'Phone Conference',
    'Legal Research',
    'Document Review',
    'Drafting',
    'Court Appearance',
    'Deposition',
    'Trial Preparation',
    'Case Strategy',
    'Email Correspondence'
  ];

  return (
    <div className={cn(
      "rounded-lg shadow-lg border p-4 space-y-4",
      theme.surface.default,
      theme.border.default,
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={cn("h-5 w-5", theme.primary.text)} />
          <h3 className={cn("font-bold", theme.text.primary)}>Quick Time Entry</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              "p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Timer Display */}
      <div className={cn(
        "p-6 rounded-lg text-center",
        theme.surface.highlight
      )}>
        <div className="text-4xl font-mono font-bold mb-4">
          {timer.isRunning || timer.elapsed > 0
            ? formatTime(timer.elapsed)
            : '00:00:00'
          }
        </div>
        <button
          onClick={toggleTimer}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors mx-auto",
            timer.isRunning
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          )}
        >
          {timer.isRunning ? (
            <>
              <Pause className="h-4 w-4" />
              Stop Timer
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Start Timer
            </>
          )}
        </button>
        {timer.elapsed > 0 && !timer.isRunning && (
          <p className={cn("text-sm mt-2", theme.text.secondary)}>
            Duration: {secondsToHours(timer.elapsed)} hours
          </p>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-3">
        {/* Date */}
        <div>
          <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>
            <Calendar className="h-3 w-3 inline mr-1" />
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className={cn(
              "w-full px-3 py-2 rounded-lg border",
              theme.surface.default,
              theme.border.default,
              theme.text.primary
            )}
          />
        </div>

        {/* Manual Duration Input */}
        <div>
          <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>
            <DollarSign className="h-3 w-3 inline mr-1" />
            Duration (hours)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={timer.isRunning ? secondsToHours(timer.elapsed) : formData.duration}
            onChange={(e) => handleDurationChange(e.target.value)}
            disabled={timer.isRunning}
            className={cn(
              "w-full px-3 py-2 rounded-lg border",
              theme.surface.default,
              theme.border.default,
              theme.text.primary,
              timer.isRunning && "opacity-50 cursor-not-allowed"
            )}
            placeholder="0.0"
          />
        </div>

        {/* Activity */}
        <div>
          <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>
            Activity
          </label>
          <select
            value={formData.activity}
            onChange={(e) => setFormData(prev => ({ ...prev, activity: e.target.value }))}
            className={cn(
              "w-full px-3 py-2 rounded-lg border",
              theme.surface.default,
              theme.border.default,
              theme.text.primary
            )}
          >
            {activities.map(activity => (
              <option key={activity} value={activity}>{activity}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className={cn(
              "w-full px-3 py-2 rounded-lg border resize-none",
              theme.surface.default,
              theme.border.default,
              theme.text.primary
            )}
            rows={3}
            placeholder="Describe the work performed..."
          />
        </div>

        {/* Billable Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="billable"
            checked={formData.billable}
            onChange={(e) => setFormData(prev => ({ ...prev, billable: e.target.checked }))}
            className="rounded"
          />
          <label htmlFor="billable" className={cn("text-sm", theme.text.secondary)}>
            Billable
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
            "bg-blue-600 hover:bg-blue-700 text-white"
          )}
        >
          <Save className="h-4 w-4" />
          Save Entry
        </button>
      </div>
    </div>
  );
};

export const TimeEntryWidget = memo(TimeEntryWidgetComponent);
TimeEntryWidget.displayName = 'TimeEntryWidget';
