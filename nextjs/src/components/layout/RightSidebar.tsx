'use client';

/**
 * Right Sidebar Component - Client Component
 * Displays contextual actions, filters, and details
 * Can be toggled via state management
 */

import { Bell, HelpCircle, Settings, X } from 'lucide-react';
import { useState } from 'react';

export function RightSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Actions
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left">
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">View Notifications</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left">
                <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Preferences</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left">
                <HelpCircle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Help & Support</span>
              </button>
            </div>
          </div>

          {/* Context Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
              Information
            </h3>
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Contextual information and actions will appear here based on your current selection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
