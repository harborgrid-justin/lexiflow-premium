/**
 * @module components/billing/TimesheetView
 * @category Billing
 * @description Weekly/monthly timesheet view with time entry management
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useMemo, memo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Edit2,
  Plus,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Components
import { Currency } from '@/components/ui/atoms/Currency';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface TimesheetViewProps {
  /** View mode: week or month */
  viewMode?: 'week' | 'month';
  /** Optional callback when adding new entry */
  onAddEntry?: () => void;
  /** Optional callback when editing entry */
  onEditEntry?: (entryId: string) => void;
  /** Optional callback when deleting entry */
  onDeleteEntry?: (entryId: string) => void;
  /** Optional class name */
  className?: string;
}

interface TimeEntry {
  id: string;
  date: string;
  caseNumber: string;
  caseName: string;
  activity: string;
  description: string;
  duration: number;
  rate: number;
  total: number;
  billable: boolean;
  status: 'draft' | 'submitted' | 'approved' | 'billed';
}

// ============================================================================
// COMPONENT
// ============================================================================

const TimesheetViewComponent: React.FC<TimesheetViewProps> = ({
  viewMode = 'week',
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  className
}) => {
  const { theme } = useTheme();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'week' | 'month'>(viewMode);

  // Mock data - in production, fetch from API
  const [timeEntries] = useState<TimeEntry[]>([
    {
      id: '1',
      date: '2026-01-06',
      caseNumber: 'CASE-2024-001',
      caseName: 'Smith v. Johnson',
      activity: 'Client Meeting',
      description: 'Initial consultation regarding contract dispute',
      duration: 2.5,
      rate: 350,
      total: 875,
      billable: true,
      status: 'draft'
    },
    {
      id: '2',
      date: '2026-01-06',
      caseNumber: 'CASE-2024-002',
      caseName: 'Acme Corp Merger',
      activity: 'Legal Research',
      description: 'Research on Delaware corporate law precedents',
      duration: 3.0,
      rate: 350,
      total: 1050,
      billable: true,
      status: 'submitted'
    },
    {
      id: '3',
      date: '2026-01-07',
      caseNumber: 'CASE-2024-001',
      caseName: 'Smith v. Johnson',
      activity: 'Drafting',
      description: 'Draft complaint for breach of contract',
      duration: 4.5,
      rate: 350,
      total: 1575,
      billable: true,
      status: 'approved'
    }
  ]);

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (selectedView === 'week') {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return { start: startOfWeek, end: endOfWeek };
    } else {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      return { start: startOfMonth, end: endOfMonth };
    }
  }, [currentDate, selectedView]);

  // Generate days in range
  const daysInRange = useMemo(() => {
    const days: Date[] = [];
    const current = new Date(dateRange.start);

    while (current <= dateRange.end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [dateRange]);

  // Group entries by date
  const entriesByDate = useMemo(() => {
    const grouped = new Map<string, TimeEntry[]>();

    daysInRange.forEach(day => {
      const dateStr = day.toISOString().split('T')[0];
      grouped.set(dateStr, []);
    });

    timeEntries.forEach(entry => {
      if (grouped.has(entry.date)) {
        grouped.get(entry.date)!.push(entry);
      }
    });

    return grouped;
  }, [daysInRange, timeEntries]);

  // Calculate totals
  const totals = useMemo(() => {
    let totalHours = 0;
    let totalAmount = 0;
    let billableHours = 0;
    let billableAmount = 0;

    timeEntries.forEach(entry => {
      totalHours += entry.duration;
      totalAmount += entry.total;
      if (entry.billable) {
        billableHours += entry.duration;
        billableAmount += entry.total;
      }
    });

    return { totalHours, totalAmount, billableHours, billableAmount };
  }, [timeEntries]);

  // Navigation handlers
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (selectedView === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (selectedView === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Format date range for header
  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    if (selectedView === 'week') {
      return `${dateRange.start.toLocaleDateString('en-US', options)} - ${dateRange.end.toLocaleDateString('en-US', options)}`;
    } else {
      return dateRange.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: TimeEntry['status'] }> = ({ status }) => {
    const statusConfig = {
      draft: { icon: Edit2, color: 'text-slate-600 bg-slate-100', label: 'Draft' },
      submitted: { icon: Clock, color: 'text-blue-600 bg-blue-100', label: 'Submitted' },
      approved: { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100', label: 'Approved' },
      billed: { icon: DollarSign, color: 'text-purple-600 bg-purple-100', label: 'Billed' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", config.color)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className={cn(
        "rounded-lg shadow-sm border p-4",
        theme.surface.default,
        theme.border.default
      )}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={navigatePrevious}
              className={cn(
                "p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className={cn("h-5 w-5", theme.primary.text)} />
              <span className={cn("font-bold text-lg", theme.text.primary)}>
                {formatDateRange()}
              </span>
            </div>
            <button
              onClick={navigateNext}
              className={cn(
                "p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={navigateToday}
              className={cn(
                "px-3 py-1 rounded text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              )}
            >
              Today
            </button>
          </div>

          {/* View Switcher and Actions */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border overflow-hidden">
              <button
                onClick={() => setSelectedView('week')}
                className={cn(
                  "px-3 py-1 text-sm font-medium transition-colors",
                  selectedView === 'week'
                    ? "bg-blue-600 text-white"
                    : "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700"
                )}
              >
                Week
              </button>
              <button
                onClick={() => setSelectedView('month')}
                className={cn(
                  "px-3 py-1 text-sm font-medium transition-colors",
                  selectedView === 'month'
                    ? "bg-blue-600 text-white"
                    : "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700"
                )}
              >
                Month
              </button>
            </div>

            <button
              onClick={onAddEntry}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </button>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div>
            <p className={cn("text-xs", theme.text.secondary)}>Total Hours</p>
            <p className={cn("text-xl font-bold", theme.text.primary)}>{totals.totalHours.toFixed(1)}</p>
          </div>
          <div>
            <p className={cn("text-xs", theme.text.secondary)}>Billable Hours</p>
            <p className={cn("text-xl font-bold text-emerald-600")}>{totals.billableHours.toFixed(1)}</p>
          </div>
          <div>
            <p className={cn("text-xs", theme.text.secondary)}>Total Value</p>
            <p className={cn("text-xl font-bold", theme.text.primary)}>
              <Currency value={totals.totalAmount} />
            </p>
          </div>
          <div>
            <p className={cn("text-xs", theme.text.secondary)}>Billable Value</p>
            <p className={cn("text-xl font-bold text-emerald-600")}>
              <Currency value={totals.billableAmount} />
            </p>
          </div>
        </div>
      </div>

      {/* Time Entry Cards */}
      <div className="space-y-4">
        {daysInRange.map(day => {
          const dateStr = day.toISOString().split('T')[0];
          const entries = entriesByDate.get(dateStr) || [];
          const dayTotal = entries.reduce((sum, e) => sum + e.duration, 0);
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <div
              key={dateStr}
              className={cn(
                "rounded-lg shadow-sm border",
                theme.surface.default,
                theme.border.default,
                isToday && "ring-2 ring-blue-500"
              )}
            >
              {/* Day Header */}
              <div className={cn(
                "px-4 py-2 border-b flex items-center justify-between",
                theme.border.default,
                isToday ? "bg-blue-50 dark:bg-blue-900/20" : theme.surface.highlight
              )}>
                <div>
                  <h4 className={cn("font-bold", theme.text.primary)}>
                    {day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    {isToday && <span className="ml-2 text-xs font-normal text-blue-600">(Today)</span>}
                  </h4>
                </div>
                {dayTotal > 0 && (
                  <span className={cn("text-sm font-medium", theme.text.secondary)}>
                    {dayTotal.toFixed(1)} hours
                  </span>
                )}
              </div>

              {/* Entries */}
              <div className="divide-y dark:divide-slate-700">
                {entries.length === 0 ? (
                  <div className={cn("px-4 py-8 text-center", theme.text.tertiary)}>
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No time entries for this day</p>
                  </div>
                ) : (
                  entries.map(entry => (
                    <div
                      key={entry.id}
                      className={cn(
                        "px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("font-medium text-sm", theme.text.primary)}>
                              {entry.caseNumber}
                            </span>
                            <span className={cn("text-xs", theme.text.tertiary)}>•</span>
                            <span className={cn("text-sm", theme.text.secondary)}>
                              {entry.caseName}
                            </span>
                          </div>
                          <p className={cn("text-xs mb-1", theme.text.secondary)}>
                            <strong>{entry.activity}</strong>: {entry.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={entry.status} />
                            {!entry.billable && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-slate-600 bg-slate-100">
                                <XCircle className="h-3 w-3" />
                                Non-billable
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={cn("text-sm font-medium", theme.text.primary)}>
                              {entry.duration.toFixed(1)} hrs
                            </p>
                            <p className={cn("text-xs", theme.text.secondary)}>
                              <Currency value={entry.total} />
                            </p>
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={() => onEditEntry?.(entry.id)}
                              className={cn(
                                "p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                              )}
                              title="Edit entry"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeleteEntry?.(entry.id)}
                              className={cn(
                                "p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                              )}
                              title="Delete entry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TimesheetView = memo(TimesheetViewComponent);
TimesheetView.displayName = 'TimesheetView';
