/**
 * @module components/enterprise/notifications/NotificationCenter
 * @category Enterprise - Notifications
 * @description Full-featured notification center page with filtering, search, and bulk actions
 */

import type { UINotification } from '@/types/notifications';
import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/theme';
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  Bell,
  Briefcase,
  Calendar,
  CheckCheck,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  Filter,
  Info,
  Search,
  Settings,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

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
export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAsReadBulk,
  onMarkAllAsRead,
  onDelete,
  onDeleteBulk,
  onArchive,
  onOpenPreferences,
  isLoading = false,
  className,
}: NotificationCenterProps) {
  const { theme, tokens } = useTheme();
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
      const entityType = (notification as Record<string, unknown>).relatedEntityType;
      switch (entityType) {
        case 'case':
          return <Briefcase className={cn(iconClass, theme.colors.info)} />;
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
        return <Info className={cn(iconClass, theme.colors.info)} />;
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
  // Total notification count tracking

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

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

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
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.surface.muted,
      }}
      className={className}
    >
      {/* Header */}
      <div style={{
        backgroundColor: theme.surface.base,
        borderBottom: `1px solid ${theme.border.default}`,
        padding: tokens.spacing.normal['2xl'],
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: tokens.spacing.normal['2xl'],
        }}>
          <div>
            <h1 style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: theme.text.primary,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing.normal.md,
            }}>
              <Bell className="h-7 w-7" />
              Notification Center
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: theme.text.secondary,
              marginTop: tokens.spacing.compact.xs,
            }}>
              {unreadCount} unread of {totalCount} total notifications
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.normal.sm }}>
            {onOpenPreferences && (
              <button
                onClick={onOpenPreferences}
                style={{
                  padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.lg}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.text.secondary,
                  backgroundColor: theme.surface.elevated,
                  borderRadius: tokens.borderRadius.lg,
                }}
                className="transition-colors focus:outline-none focus:ring-2"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.surface.elevated}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Preferences
              </button>
            )}
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                style={{
                  padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.lg}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.surface.base,
                  backgroundColor: theme.primary.DEFAULT,
                  borderRadius: tokens.borderRadius.lg,
                }}
                className="transition-opacity focus:outline-none focus:ring-2"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: theme.text.muted }} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                paddingTop: tokens.spacing.compact.sm,
                paddingBottom: tokens.spacing.compact.sm,
                backgroundColor: theme.surface.elevated,
                border: 'none',
                borderRadius: tokens.borderRadius.lg,
                fontSize: tokens.typography.fontSize.sm,
                color: theme.text.primary
              }}
              className="focus:outline-none focus:ring-2"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.text.muted,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme.text.secondary}
                onMouseLeave={(e) => e.currentTarget.style.color = theme.text.muted}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.lg}`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                borderRadius: tokens.borderRadius.lg,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing.compact.xs,
                backgroundColor: showFilters ? theme.primary.DEFAULT + '20' : theme.surface.elevated,
                color: showFilters ? theme.primary.DEFAULT : theme.text.secondary,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              className="focus:outline-none focus:ring-2"
              onMouseEnter={(e) => !showFilters && (e.currentTarget.style.backgroundColor = theme.surface.hover)}
              onMouseLeave={(e) => !showFilters && (e.currentTarget.style.backgroundColor = theme.surface.elevated)}
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
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: tokens.spacing.compact.xs,
                  width: '12rem',
                  backgroundColor: theme.surface.base,
                  borderRadius: tokens.borderRadius.lg,
                  boxShadow: tokens.shadows.xl,
                  border: `1px solid ${theme.border.default}`,
                  padding: `${tokens.spacing.compact.sm} 0`,
                  zIndex: 10
                }}
              >
                {(['newest', 'oldest', 'priority'] as SortOption[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setShowFilters(false);
                    }}
                    style={{
                      width: '100%',
                      padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.lg}`,
                      textAlign: 'left',
                      fontSize: tokens.typography.fontSize.sm,
                      backgroundColor: sortBy === option ? theme.primary.DEFAULT + '15' : 'transparent',
                      color: sortBy === option ? theme.primary.DEFAULT : theme.text.secondary,
                      fontWeight: sortBy === option ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => sortBy !== option && (e.currentTarget.style.backgroundColor = theme.surface.hover)}
                    onMouseLeave={(e) => sortBy !== option && (e.currentTarget.style.backgroundColor = 'transparent')}
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
      <div style={{ backgroundColor: theme.surface.base, borderBottom: `1px solid ${theme.border.default}`, padding: `0 ${tokens.spacing.normal['2xl']}`, overflowX: 'auto' }}>
        <div className="flex gap-1 min-w-max">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              style={{
                padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                borderBottom: `2px solid ${selectedFilter === tab.id ? theme.primary.DEFAULT : 'transparent'}`,
                color: selectedFilter === tab.id ? theme.primary.DEFAULT : theme.text.secondary,
                whiteSpace: 'nowrap',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${selectedFilter === tab.id ? theme.primary.DEFAULT : 'transparent'}`,
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => selectedFilter !== tab.id && (e.currentTarget.style.color = theme.text.primary)}
              onMouseLeave={(e) => selectedFilter !== tab.id && (e.currentTarget.style.color = theme.text.secondary)}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  style={{
                    marginLeft: tokens.spacing.compact.xs,
                    padding: `${tokens.spacing.compact.xs} ${tokens.spacing.compact.sm}`,
                    fontSize: tokens.typography.fontSize.xs,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: selectedFilter === tab.id ? theme.primary.DEFAULT + '20' : theme.surface.elevated,
                    color: selectedFilter === tab.id ? theme.primary.DEFAULT : theme.text.muted
                  }}
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
            style={{
              backgroundColor: theme.primary.DEFAULT + '15',
              borderBottom: `1px solid ${theme.primary.DEFAULT}40`,
              padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal['2xl']}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.normal.lg }}>
              <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: theme.primary.DEFAULT }}>
                {selectedIds.size} selected
              </span>
              <button
                onClick={handleBulkMarkAsRead}
                style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: theme.primary.DEFAULT, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Mark as read
              </button>
              <button
                onClick={handleBulkDelete}
                style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: theme.status.error.text, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Delete
              </button>
            </div>
            <button
              onClick={clearSelection}
              style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: theme.primary.DEFAULT, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Clear selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing.normal['2xl'] }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
            <div style={{
              display: 'inline-block',
              width: '2rem',
              height: '2rem',
              border: `4px solid ${theme.primary.DEFAULT}`,
              borderRightColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        ) : filteredAndSortedNotifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <Bell style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem', color: theme.text.muted }} />
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: theme.text.secondary, marginBottom: tokens.spacing.compact.sm }}>
              {searchQuery || selectedFilter !== 'all'
                ? 'No notifications found'
                : 'No notifications'}
            </h3>
            <p style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.muted }}>
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
                  style={{
                    backgroundColor: theme.surface.base,
                    borderRadius: tokens.borderRadius.xl,
                    border: `1px solid ${!notification.read ? theme.primary.DEFAULT + '40' : theme.border.default}`,
                    padding: tokens.spacing.normal.xl,
                    transition: 'all 0.2s',
                    boxShadow: !notification.read ? tokens.shadows.sm : 'none',
                    outline: selectedIds.has(notification.id) ? `2px solid ${theme.primary.DEFAULT}` : 'none',
                    outlineOffset: '2px'
                  }}
                  className="group"
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.has(notification.id)}
                      onChange={() => toggleSelection(notification.id)}
                      className={cn("mt-1 h-4 w-4 rounded cursor-pointer", theme.border.default, theme.colors.info)}
                      aria-label={`Select ${notification.title}`}
                    />

                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: tokens.spacing.normal.md, marginBottom: tokens.spacing.compact.sm }}>
                        <h3 style={{ fontWeight: tokens.typography.fontWeight.semibold, color: theme.text.primary }}>
                          {notification.title}
                          {!notification.read && (
                            <span style={{ display: 'inline-block', marginLeft: tokens.spacing.compact.xs, width: '0.5rem', height: '0.5rem', backgroundColor: theme.primary.DEFAULT, borderRadius: '50%' }} />
                          )}
                        </h3>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: theme.text.muted, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: tokens.spacing.compact.xs }}>
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(notification.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <p style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary, marginBottom: tokens.spacing.normal.md }}>
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
                            cn('bg-blue-100 dark:bg-blue-900/30', 'text-blue-700 dark:text-blue-300')
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
                        className={cn("p-2 rounded-lg focus:outline-none focus:ring-2", 'hover:bg-red-100 dark:hover:bg-red-900/30', theme.status.error.text, 'focus:ring-red-500')}
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
}

export default NotificationCenter;
