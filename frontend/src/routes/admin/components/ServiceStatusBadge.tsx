import React from 'react';

interface ServiceStatusBadgeProps {
  status: string;
}

export function ServiceStatusBadge({ status }: ServiceStatusBadgeProps) {
  const colors: Record<string, string> = {
    healthy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    degraded: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    down: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    unknown: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${colors[status] || colors.unknown}`}>
      {status}
    </span>
  );
}
