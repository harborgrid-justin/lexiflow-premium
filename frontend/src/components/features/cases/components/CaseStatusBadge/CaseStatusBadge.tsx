/**
 * CaseStatusBadge Component
 *
 * Displays a case status with appropriate color coding and styling.
 * Supports all case statuses defined in the CaseStatus enum.
 *
 * @module components/features/cases/CaseStatusBadge
 */

import { cn } from '@/lib/utils';
import type { CaseStatus } from '@/types/enums';

export interface CaseStatusBadgeProps {
  /** The case status to display */
  status: CaseStatus | string;
  /** Optional size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional additional CSS classes */
  className?: string;
  /** Show icon alongside text */
  showIcon?: boolean;
}

/**
 * Map case statuses to color classes and icons
 */
const STATUS_CONFIG: Record<string, {
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon?: string;
  label?: string;
}> = {
  'Open': {
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: '📂',
    label: 'Open',
  },
  'Active': {
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-700 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: '✅',
    label: 'Active',
  },
  'Discovery': {
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-700 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: '🔍',
    label: 'Discovery',
  },
  'Trial': {
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    textColor: 'text-orange-700 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-800',
    icon: '⚖️',
    label: 'Trial',
  },
  'Pre-Filing': {
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    textColor: 'text-gray-700 dark:text-gray-400',
    borderColor: 'border-gray-200 dark:border-gray-800',
    icon: '📝',
    label: 'Pre-Filing',
  },
  'Settled': {
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    textColor: 'text-teal-700 dark:text-teal-400',
    borderColor: 'border-teal-200 dark:border-teal-800',
    icon: '🤝',
    label: 'Settled',
  },
  'Closed': {
    bgColor: 'bg-gray-100 dark:bg-gray-800/40',
    textColor: 'text-gray-600 dark:text-gray-500',
    borderColor: 'border-gray-300 dark:border-gray-700',
    icon: '✔️',
    label: 'Closed',
  },
  'Archived': {
    bgColor: 'bg-slate-50 dark:bg-slate-900/20',
    textColor: 'text-slate-600 dark:text-slate-500',
    borderColor: 'border-slate-300 dark:border-slate-700',
    icon: '📦',
    label: 'Archived',
  },
  'On Hold': {
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    icon: '⏸️',
    label: 'On Hold',
  },
  'Appeal': {
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    textColor: 'text-indigo-700 dark:text-indigo-400',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    icon: '📜',
    label: 'Appeal',
  },
  'Transferred': {
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    textColor: 'text-pink-700 dark:text-pink-400',
    borderColor: 'border-pink-200 dark:border-pink-800',
    icon: '↔️',
    label: 'Transferred',
  },
};

/**
 * Size variants for the badge
 */
const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

/**
 * CaseStatusBadge component displays the status of a case with color-coded styling
 */
export function CaseStatusBadge({
  status,
  size = 'md',
  className,
  showIcon = false,
}: CaseStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Active'] || {
    label: status,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    icon: null
  };
  const displayLabel = config.label || status;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        config.bgColor,
        config.textColor,
        config.borderColor,
        SIZE_CLASSES[size],
        className
      )}
      title={`Case Status: ${displayLabel}`}
    >
      {showIcon && config.icon && (
        <span className="leading-none" aria-hidden="true">
          {config.icon}
        </span>
      )}
      <span>{displayLabel}</span>
    </span>
  );
}

/**
 * Helper function to get status color for other use cases
 */
export function getStatusColor(status: string): string {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Active'] || { textColor: 'text-gray-800' };
  return config.textColor;
}

/**
 * Helper function to get all available statuses
 */
export function getAllStatuses(): string[] {
  return Object.keys(STATUS_CONFIG);
}
