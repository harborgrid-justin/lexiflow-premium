/**
 * @module components/enterprise/notifications/NotificationCenter
 * @category Enterprise - Notifications
 * @description Full-featured notification center page with filtering, search, and bulk actions
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  Filter,
  CheckCheck,
  Trash2,
  Settings,
  Archive,
  Clock,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  Calendar,
  Briefcase,
  FileText,
  CreditCard,
  X,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/utils/cn';
import type { UINotification, NotificationFilters } from '@/types/notifications';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface NotificationCenterProps {
  /** List of all notifications */
  notifications: UINotification[];
  /** Mark single notification as read */
  onMarkAsRead: (id: string) => void;
  /** Mark multiple notifications as read */
  onMarkAsReadBulk: (ids: string[]) => void;
  /** Mark all as read */
  onMarkAllAsRead: () => void;
  /** Delete single notification */
  onDelete: (id: string) => void;
  /** Delete multiple notifications */
  onDeleteBulk: (ids: string[]) => void;
  /** Clear all notifications */
  onClearAll: () => void;
  /** Archive notification */
  onArchive?: (id: string) => void;
  /** Navigate to preferences */
  onOpenPreferences?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
}

type FilterType = 'all' | 'unread' | 'success' | 'error' | 'warning' | 'info';
type SortOption = 'newest' | 'oldest' | 'priority';

// ============================================================================
// COMPONENT
// ============================================================================
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAsReadBulk,
  onMarkAllAsRead,
  onDelete,
  onDeleteBulk,
  onClearAll,
  onArchive,
  onOpenPreferences,
  isLoading = false,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Get notification icon
  const getNotificationIcon = (notification: UINotification) => {
    const iconClass = 'h-5 w-5';

    // Check entity type
    if ('relatedEntityType' in notification) {
      const entityType = (notification as any).relatedEntityType;
      switch (entityType) {
        case 'case':
          return <Briefcase className={cn(iconClass, 'text-blue-500')} />;
        case 'document':
          return <FileText className={cn(iconClass, 'text-purple-500')} />;
        case 'calendar':
          return <Calendar className={cn(iconClass, 'text-orange-500')} />;
        case 'billing':
          return <CreditCard className={cn(iconClass, 'text-green-500')} />;
      }
    }

    // Fall back to type
    switch (notification.type) {
      case 'success':
        return <CheckCircle className={cn(iconClass, 'text-emerald-500')} />;
      case 'error':
        return <AlertCircle className={cn(iconClass, 'text-rose-500')} />;
      case 'warning':
        return <AlertTriangle className={cn(iconClass, 'text-amber-500')} />;
      default:
        return <Info className={cn(iconClass, 'text-blue-500')} />;
    }
  };

  // Filter and sort notifications
  const filteredAndSortedNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
      );
    }

    // Apply filter
    if (selectedFilter === 'unread') {
      filtered = filtered.filter((n) => !n.read);
    } else if (selectedFilter !== 'all') {
      filtered = filtered.filter((n) => n.type === selectedFilter);
    }

    // Apply sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return b.timestamp - a.timestamp;
      } else if (sortBy === 'oldest') {
        return a.timestamp - b.timestamp;
      } else {
        // priority
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
    });

    return filtered;
  }, [notifications, searchQuery, selectedFilter, sortBy]);

  // Calculate stats
  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalCount = notifications.length;

  // Selection handlers
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredAndSortedNotifications.map((n) => n.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const isAllSelected =
    selectedIds.size > 0 &&
    selectedIds.size === filteredAndSortedNotifications.length;

  // Bulk actions
  const handleBulkMarkAsRead = () => {
    onMarkAsReadBulk(Array.from(selectedIds));
    clearSelection();
  };

  const handleBulkDelete = () => {
    onDeleteBulk(Array.from(selectedIds));
    clearSelection();
  };

  // Filter tabs
  const filterTabs: { id: FilterType; label: string; count?: number }[] = [
    { id: 'all', label: 'All', count: totalCount },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'success', label: 'Success' },
    { id: 'error', label: 'Errors' },
    { id: 'warning', label: 'Warnings' },
    { id: 'info', label: 'Info' },
  ];

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-slate-50 dark:bg-slate-900',
        className
      )}
    >
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              <Bell className="h-7 w-7" />
              Notification Center
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {unreadCount} unread of {totalCount} total notifications
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPreferences && (
              <button
                onClick={onOpenPreferences}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Preferences
              </button>
            )}
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <CheckCheck className="h-4 w-4 inline mr-2" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2',
                showFilters
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              )}
            >
              <Filter className="h-4 w-4" />
              Sort
              <ChevronDown className="h-4 w-4" />
            </button>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-10"
              >
                {(['newest', 'oldest', 'priority'] as SortOption[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setShowFilters(false);
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm transition-colors',
                      sortBy === option
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    )}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                selectedFilter === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'ml-2 px-2 py-0.5 text-xs rounded-full',
                    selectedFilter === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedIds.size} selected
              </span>
              <button
                onClick={handleBulkMarkAsRead}
                className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline"
              >
                Mark as read
              </button>
              <button
                onClick={handleBulkDelete}
                className="text-sm font-medium text-red-700 dark:text-red-300 hover:underline"
              >
                Delete
              </button>
            </div>
            <button
              onClick={clearSelection}
              className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline"
            >
              Clear selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
          </div>
        ) : filteredAndSortedNotifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {searchQuery || selectedFilter !== 'all'
                ? 'No notifications found'
                : 'No notifications'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {searchQuery || selectedFilter !== 'all'
                ? 'Try adjusting your filters'
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 max-w-4xl mx-auto">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className={cn(
                    'bg-white dark:bg-slate-800 rounded-xl border p-5 transition-all group',
                    !notification.read
                      ? 'border-blue-200 dark:border-blue-800 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700',
                    selectedIds.has(notification.id) &&
                      'ring-2 ring-blue-500 shadow-lg'
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.has(notification.id)}
                      onChange={() => toggleSelection(notification.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      aria-label={`Select ${notification.title}`}
                    />

                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {notification.title}
                          {!notification.read && (
                            <span className="inline-block ml-2 w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(notification.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                        {notification.message}
                      </p>

                      {/* Tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            'text-xs px-2 py-1 rounded-full font-medium',
                            notification.type === 'success' &&
                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
                            notification.type === 'error' &&
                              'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
                            notification.type === 'warning' &&
                              'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                            notification.type === 'info' &&
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          )}
                        >
                          {notification.type}
                        </span>
                        {notification.priority !== 'normal' && (
                          <span
                            className={cn(
                              'text-xs px-2 py-1 rounded-full font-medium',
                              notification.priority === 'urgent' &&
                                'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
                              notification.priority === 'high' &&
                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                              notification.priority === 'low' &&
                                'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            )}
                          >
                            {notification.priority}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Mark as read"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {onArchive && (
                        <button
                          onClick={() => onArchive(notification.id)}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(notification.id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
