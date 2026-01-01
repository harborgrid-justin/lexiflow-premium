'use client';

/**
 * Header Component - Client Component
 * Top navigation bar with search and user menu
 */

import { Bell, Menu, Search } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side - Mobile menu and search */}
        <div className="flex items-center gap-4 flex-1">
          <button className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="search"
              placeholder="Search cases, documents..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Right side - Notifications */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-600 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
