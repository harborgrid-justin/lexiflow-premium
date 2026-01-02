'use client';

import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus
} from 'lucide-react';
import { useState } from 'react';

type CalendarView = 'month' | 'week' | 'day' | 'agenda';

const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Status Conference',
    matter: 'Smith v. Jones',
    time: '10:00 AM',
    type: 'hearing',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Motion to Dismiss Deadline',
    matter: 'TechCorp Merger',
    time: '5:00 PM',
    type: 'deadline',
    priority: 'high'
  },
  {
    id: '3',
    title: 'Client Meeting',
    matter: 'Estate of H. Doe',
    time: '2:00 PM',
    type: 'meeting',
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Discovery Production',
    matter: 'City of NY vs. Uber',
    time: 'All Day',
    type: 'filing',
    priority: 'medium'
  }
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CaseCalendar() {
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentDate);

  const renderCalendarGrid = () => {
    const grid = [];
    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      grid.push(<div key={`empty-${i}`} className="h-32 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700" />);
    }

    // Days of current month
    for (let i = 1; i <= days; i++) {
      const hasEvent = i % 5 === 0 || i === 15 || i === 22; // Mock events
      grid.push(
        <div key={i} className="h-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group relative">
          <span className={`text-sm font-medium ${i === new Date().getDate()
              ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full'
              : 'text-slate-700 dark:text-slate-300'
            }`}>
            {i}
          </span>
          {hasEvent && (
            <div className="mt-2 space-y-1">
              <div className="text-xs p-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 truncate">
                Status Conf.
              </div>
              {i === 15 && (
                <div className="text-xs p-1 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 truncate">
                  Filing Deadline
                </div>
              )}
            </div>
          )}
          <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded">
            <Plus className="h-3 w-3 text-slate-500" />
          </button>
        </div>
      );
    }
    return grid;
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Case Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400">Schedule and Deadlines</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
            {(['month', 'week', 'day', 'agenda'] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${view === v
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
            <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-600 dark:text-slate-400">Hearings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-600 dark:text-slate-400">Deadlines</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-slate-600 dark:text-slate-400">Meetings</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
          {DAYS.map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {renderCalendarGrid()}
        </div>
      </div>
    </div>
  );
}
