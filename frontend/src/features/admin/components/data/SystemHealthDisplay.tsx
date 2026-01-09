/**
 * Service Coverage Indicator Component
 *
 * Displays backend API coverage statistics showing which services
 * are using the backend vs IndexedDB.
 */

import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useDataSource } from '@/providers';
import { cn } from '@/shared/lib/cn';
import { calculateCoverage } from './utils';
import { BACKEND_ENABLED_SERVICES } from './constants';

/**
 * Displays real-time metrics about backend API service coverage
 */
export const SystemHealthDisplay: React.FC = () => {
  const { theme } = useTheme();
  const { currentSource } = useDataSource();
  const [showDetails, setShowDetails] = useState(false);

  const backendServicesCount = BACKEND_ENABLED_SERVICES.length;
  const totalServices = backendServicesCount;
  const { coverage, indexedDbOnly, percentage } = calculateCoverage(
    currentSource,
    backendServicesCount,
    totalServices
  );

  return (
    <div className={cn("p-5 rounded-xl border shadow-sm", theme.surface.default, theme.border.default)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn("text-base font-semibold flex items-center gap-2", theme.text.primary)}>
          <Activity className="h-5 w-5 text-blue-500" />
          Backend API Coverage
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={cn(
            "text-xs font-medium px-3 py-1.5 rounded-lg border hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors",
            theme.border.default,
            theme.text.primary
          )}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className={cn(
          "p-4 rounded-lg",
          currentSource === 'postgresql'
            ? "bg-blue-50 dark:bg-blue-900/20"
            : "bg-gray-50 dark:bg-slate-800"
        )}>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Backend API</div>
          <div className={cn(
            "text-2xl font-bold",
            currentSource === 'postgresql'
              ? "text-blue-600 dark:text-blue-400"
              : theme.text.primary
          )}>
            {coverage}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">IndexedDB Only</div>
          <div className={cn("text-2xl font-bold", theme.text.primary)}>
            {indexedDbOnly}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Services</div>
          <div className={cn("text-2xl font-bold", theme.text.primary)}>
            {totalServices}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Coverage: {percentage}%</span>
          <span className="font-medium">{coverage} / {totalServices}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className={cn("text-sm mb-2", theme.text.secondary)}>
            <strong>Backend API Services ({coverage}):</strong>
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {BACKEND_ENABLED_SERVICES.slice(0, 20).map(service => (
              <span
                key={service}
                className="px-2 py-1 text-xs font-mono rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {service}
              </span>
            ))}
            {BACKEND_ENABLED_SERVICES.length > 20 && (
              <span className="px-2 py-1 text-xs font-mono rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                +{BACKEND_ENABLED_SERVICES.length - 20} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
