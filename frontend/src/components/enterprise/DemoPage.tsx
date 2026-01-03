/**
 * @module components/enterprise/DemoPage
 * @description Demo page showcasing EnterpriseDashboard and AnalyticsWidgets
 *
 * This file can be used to:
 * 1. Test the components in isolation
 * 2. Demonstrate features to stakeholders
 * 3. Serve as a reference implementation
 *
 * Usage:
 * Import this component into a route file or render it directly
 * for testing purposes.
 */

import { Activity, BarChart3, LineChart } from 'lucide-react';
import React, { useState } from 'react';
import { AnalyticsWidgets } from './AnalyticsWidgets';
import { EnterpriseDashboard } from './EnterpriseDashboard';

type ViewMode = 'dashboard' | 'analytics' | 'combined';

export const EnterpriseDemoPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('combined');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([
    'case-trends',
    'billing-trends',
    'attorney-utilization',
    'client-acquisition',
  ]);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    console.log('Dashboard refreshed');
  };

  const handleExport = () => {
    console.log('Exporting dashboard data...');
    // Implement export functionality
  };

  const handleConfigureWidgets = () => {
    console.log('Opening widget configuration...', selectedWidgets);
    // Toggle a widget selection modal
  };

  const handleToggleWidget = (widgetId: string) => {
    setSelectedWidgets(prev =>
      prev.includes(widgetId)
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const dateRange = {
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    end: new Date(),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Demo Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Enterprise Dashboard Demo
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Interactive demo of executive dashboards and analytics widgets
              </p>
            </div>

            {/* View Mode Selector */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'dashboard'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'analytics'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
              >
                <LineChart className="h-4 w-4" />
                Analytics
              </button>
              <button
                onClick={() => setViewMode('combined')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'combined'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
              >
                <Activity className="h-4 w-4" />
                Combined
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <div className="max-w-7xl mx-auto px-8 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Demo Mode:</strong> Using mock data. Connect to your API to display real metrics.
              {viewMode === 'combined' && ' Scroll down to see both dashboard and analytics sections.'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Dashboard View */}
        {(viewMode === 'dashboard' || viewMode === 'combined') && (
          <div className="mb-12">
            {viewMode === 'combined' && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Executive Dashboard
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  High-level KPIs, activity feed, and key metrics
                </p>
              </div>
            )}
            <EnterpriseDashboard
              userId="demo-user"
              dateRange={dateRange}
              isLoading={isLoading}
              onRefresh={handleRefresh}
              onExport={handleExport}
              onConfigureWidgets={handleConfigureWidgets}
            />
          </div>
        )}

        {/* Analytics View */}
        {(viewMode === 'analytics' || viewMode === 'combined') && (
          <div>
            {viewMode === 'combined' && (
              <div className="mb-6 pt-12 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Analytics Widgets
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Detailed charts and trend analysis
                </p>
              </div>
            )}
            <AnalyticsWidgets
              dateRange={dateRange}
              isLoading={isLoading}
              onRefresh={handleRefresh}
              selectedWidgets={selectedWidgets}
            />
          </div>
        )}
      </div>

      {/* Demo Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium mb-1">Components Available:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>EnterpriseDashboard - Executive KPIs and real-time insights</li>
                <li>AnalyticsWidgets - Detailed charts and trend analysis</li>
              </ul>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                LexiFlow Premium
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Enterprise Legal Platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseDemoPage;

/**
 * USAGE IN ROUTES:
 *
 * To add this demo to your application, create a new route file:
 *
 * File: /home/user/lexiflow-premium/frontend/src/routes/demo/enterprise.tsx
 *
 * ```tsx
 * import EnterpriseDemoPage from '@/components/enterprise/DemoPage';
 * import type { Route } from "./+types/enterprise";
 *
 * export function meta({ }: Route.MetaArgs) {
 *   return [
 *     { title: 'Enterprise Dashboard Demo' },
 *     { name: 'description', content: 'Interactive demo of enterprise features' }
 *   ];
 * }
 *
 * export default function DemoRoute() {
 *   return <EnterpriseDemoPage />;
 * }
 * ```
 *
 * Then access it at: http://localhost:5173/demo/enterprise
 */
