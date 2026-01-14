/**
 * SystemSettings Component
 * System-level settings including data source configuration
 */

import { Card } from '@/shared/ui/molecules/Card/Card';
import { DataSourceSelector } from '@/shared/ui/molecules/DataSourceSelector/DataSourceSelector';
import { Database, Settings, Zap } from 'lucide-react';
export function SystemSettings() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">System Settings</h2>
            <p className="text-sm text-slate-600">Configure system-level preferences and infrastructure</p>
          </div>
        </div>

        {/* Real-time monitoring badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-xs font-medium text-emerald-700">Real-Time Monitoring Active</span>
        </div>
      </div>

      {/* Data Source Configuration */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span>Data Source Configuration</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="text-sm text-slate-600 mb-4">
            Choose where your data is stored and managed. The backend must be running to use
            PostgreSQL or Cloud sync modes.
          </div>
          <DataSourceSelector />
        </div>
      </Card>

      {/* Performance Settings */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            <span>Performance</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="text-sm text-slate-600">
            Performance settings will be added here.
          </div>
        </div>
      </Card>
    </div>
  );
};
