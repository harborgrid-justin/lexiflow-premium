'use client';

/**
 * Header Component - Client Component
 * Top navigation bar with search, notifications, and user menu
 * Enterprise-grade with dropdown menus and responsive design
 */

import { Bell, ChevronDown, LogOut, Menu, Search, Settings, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DataService } from '@/services/data/dataService';

export function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        // Fetch User
        const users = await DataService.users.getAll();
        if (mounted && users && users.length > 0) {
          // Ideally we would get the logged in user, but for now we take the first available
          setCurrentUser(users[0]);
        }

        // Fetch Notifications
        const notificationService = await DataService.notifications;
        const notifs = await notificationService.getAll();
        if (mounted) {
          setNotifications(notifs.slice(0, 5)); // Limit to 5 for header
        }
      } catch (error) {
        console.error('Error fetching header data:', error);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side - Mobile menu and search */}
        <div className="flex items-center gap-4 flex-1">
          <button className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>

          {/* Global Search */}
          <div className="relative max-w-md w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="search"
              placeholder="Search cases, documents..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all"
            />
          </div>
        </div>

        {/* Right side - Notifications and User Menu */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 z-50">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No new notifications</p>
                    ) : (
                      notifications.map((notif: any) => (
                        <div key={notif.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                            {notif.title || notif.message || 'New Notification'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString() : 'Just now'}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative ml-4 pl-4 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                {currentUser ? (currentUser.firstName?.[0] || currentUser.name?.[0] || 'U') : 'JD'}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">
                {currentUser ? (currentUser.name || `${currentUser.firstName} ${currentUser.lastName}` || 'User') : 'John Doe'}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 z-50">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {currentUser ? (currentUser.name || `${currentUser.firstName} ${currentUser.lastName}`) : 'John Doe'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {currentUser?.role || 'Attorney'}
                  </p>
                </div>
                <div className="p-2 space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                    <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                    <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Settings</span>
                  </button>
                  <div className="border-t border-slate-200 dark:border-slate-800 my-1" />
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left">
                    <LogOut className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
