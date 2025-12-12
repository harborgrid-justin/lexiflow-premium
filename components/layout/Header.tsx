/**
 * Header Component
 * Simple header with branding, navigation, and user menu
 */

import React, { useState, useRef } from 'react';
import { Menu, Bell, User, Settings, LogOut, Moon, Sun, Search } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { useClickOutside } from '../../hooks/useClickOutside';

interface HeaderProps {
  onToggleSidebar?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  brandName?: string;
  brandLogo?: string;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  brandName = 'LexiFlow',
  brandLogo,
  className,
}) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { unreadCount } = useNotifications();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useClickOutside(userMenuRef, () => setIsUserMenuOpen(false));
  useClickOutside(notificationRef, () => setIsNotificationOpen(false));

  return (
    <div
      className={cn(
        'h-16 px-4 flex items-center justify-between gap-4',
        theme.surface.secondary,
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={cn(
              'p-2 rounded-lg transition-colors',
              theme.text.secondary,
              `hover:${theme.surface.highlight}`
            )}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Brand */}
        <div className="flex items-center gap-2">
          {brandLogo ? (
            <img src={brandLogo} alt={brandName} className="h-8 w-auto" />
          ) : (
            <div
              className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center font-bold text-white',
                'bg-gradient-to-br from-blue-500 to-purple-600'
              )}
            >
              {brandName.charAt(0)}
            </div>
          )}
          <span className={cn('text-lg font-bold', theme.text.primary)}>
            {brandName}
          </span>
        </div>
      </div>

      {/* Center Section - Search */}
      {showSearch && (
        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
          <div className="relative">
            <Search
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4',
                theme.text.tertiary
              )}
            />
            <input
              type="search"
              placeholder="Search..."
              className={cn(
                'w-full h-10 pl-10 pr-4 border rounded-lg text-sm',
                'focus:outline-none focus:ring-2',
                theme.surface.input,
                theme.border.default,
                theme.border.focused,
                theme.text.primary
              )}
            />
          </div>
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'p-2 rounded-lg transition-colors',
            theme.text.secondary,
            `hover:${theme.surface.highlight}`
          )}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        {showNotifications && (
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={cn(
                'relative p-2 rounded-lg transition-colors',
                theme.text.secondary,
                `hover:${theme.surface.highlight}`
              )}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div
                className={cn(
                  'absolute right-0 mt-2 w-80 rounded-lg shadow-lg border overflow-hidden z-50',
                  theme.surface.secondary,
                  theme.border.default
                )}
              >
                <div className={cn('p-3 border-b font-semibold', theme.border.default)}>
                  Notifications
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {unreadCount === 0 ? (
                    <div className={cn('p-6 text-center', theme.text.secondary)}>
                      No new notifications
                    </div>
                  ) : (
                    <div className="p-2">
                      {/* Notification items would go here */}
                      <p className={cn('text-sm p-2', theme.text.secondary)}>
                        You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Menu */}
        {showUserMenu && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                theme.text.secondary,
                `hover:${theme.surface.highlight}`
              )}
              aria-label="User menu"
            >
              <User className="h-5 w-5" />
            </button>

            {isUserMenuOpen && (
              <div
                className={cn(
                  'absolute right-0 mt-2 w-48 rounded-lg shadow-lg border overflow-hidden z-50',
                  theme.surface.secondary,
                  theme.border.default
                )}
              >
                <button
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors',
                    theme.text.primary,
                    `hover:${theme.surface.highlight}`
                  )}
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors',
                    theme.text.primary,
                    `hover:${theme.surface.highlight}`
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <div className={cn('border-t', theme.border.default)} />
                <button
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors',
                    'text-red-600 dark:text-red-400',
                    `hover:${theme.surface.highlight}`
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
