import React, { useState } from 'react';
import { WorkflowTriggerType } from './types';

/**
 * TriggerConfiguration Component
 * Configure workflow triggers and conditions
 */
export const TriggerConfiguration: React.FC<{
  trigger: WorkflowTriggerType;
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}> = ({ trigger, config, onChange }) => {
  const handleConfigChange = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const renderTriggerConfig = () => {
    switch (trigger) {
      case WorkflowTriggerType.DOCUMENT_UPLOAD:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Type
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={config.documentType || ''}
                onChange={(e) => handleConfigChange('documentType', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="contract">Contract</option>
                <option value="brief">Brief</option>
                <option value="motion">Motion</option>
                <option value="evidence">Evidence</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum File Size (MB)
              </label>
              <input
                type="number"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={config.minFileSizeMB || ''}
                onChange={(e) => handleConfigChange('minFileSizeMB', parseFloat(e.target.value))}
              />
            </div>
          </div>
        );

      case WorkflowTriggerType.DEADLINE_APPROACHING:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Days Before Deadline
              </label>
              <input
                type="number"
                min="1"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={config.daysBeforeDeadline || 7}
                onChange={(e) => handleConfigChange('daysBeforeDeadline', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeOverdue"
                checked={config.includeOverdue || false}
                onChange={(e) => handleConfigChange('includeOverdue', e.target.checked)}
              />
              <label htmlFor="includeOverdue" className="text-sm text-gray-700">
                Include overdue items
              </label>
            </div>
          </div>
        );

      case WorkflowTriggerType.INVOICE_GENERATED:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Amount ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={config.minAmount || ''}
                onChange={(e) => handleConfigChange('minAmount', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Type
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={config.clientType || ''}
                onChange={(e) => handleConfigChange('clientType', e.target.value)}
              >
                <option value="">All Clients</option>
                <option value="corporate">Corporate</option>
                <option value="individual">Individual</option>
                <option value="government">Government</option>
              </select>
            </div>
          </div>
        );

      case WorkflowTriggerType.SCHEDULE:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Type
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={config.scheduleType || 'daily'}
                onChange={(e) => handleConfigChange('scheduleType', e.target.value)}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="cron">Custom (Cron)</option>
              </select>
            </div>

            {config.scheduleType === 'cron' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cron Expression
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
                  value={config.cronExpression || ''}
                  onChange={(e) => handleConfigChange('cronExpression', e.target.value)}
                  placeholder="0 9 * * *"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Example: "0 9 * * *" runs daily at 9:00 AM
                </p>
              </div>
            )}

            {config.scheduleType === 'daily' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time of Day
                </label>
                <input
                  type="time"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={config.timeOfDay || '09:00'}
                  onChange={(e) => handleConfigChange('timeOfDay', e.target.value)}
                />
              </div>
            )}

            {config.scheduleType === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Week
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={config.dayOfWeek || 'monday'}
                  onChange={(e) => handleConfigChange('dayOfWeek', e.target.value)}
                >
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>
            )}
          </div>
        );

      case WorkflowTriggerType.WEBHOOK:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook Secret
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
                value={config.webhookSecret || ''}
                onChange={(e) => handleConfigChange('webhookSecret', e.target.value)}
                placeholder="Leave blank to auto-generate"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="verifySignature"
                checked={config.verifySignature !== false}
                onChange={(e) => handleConfigChange('verifySignature', e.target.checked)}
              />
              <label htmlFor="verifySignature" className="text-sm text-gray-700">
                Verify webhook signature
              </label>
            </div>
          </div>
        );

      case WorkflowTriggerType.MANUAL:
        return (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            This workflow will only run when manually triggered by a user.
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
            No additional configuration required for this trigger type.
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Trigger Configuration
        </h4>
        {renderTriggerConfig()}
      </div>
    </div>
  );
};

export default TriggerConfiguration;
