/**
 * System Settings Page - Server Component with Data Fetching
 * Global system configuration and feature toggles
 */
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'System Settings | LexiFlow',
  description: 'Global system configuration and preferences',
};

async function SettingsForm() {
  const settings = await apiFetch(API_ENDPOINTS.SYSTEM_SETTINGS.GET);

  return (
    <div className="space-y-6">
      {/* Firm Information */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">Firm Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Firm Name
            </label>
            <input
              type="text"
              defaultValue={settings.firmName}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tax ID (EIN)
            </label>
            <input
              type="text"
              defaultValue={settings.taxId}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Primary Contact Email
            </label>
            <input
              type="email"
              defaultValue={settings.contactEmail}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              defaultValue={settings.phone}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Default Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">Default Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Default Timezone
            </label>
            <select
              defaultValue={settings.timezone}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Currency Format
            </label>
            <select
              defaultValue={settings.currency}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Date Format
            </label>
            <select
              defaultValue={settings.dateFormat}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Default Billing Rate
            </label>
            <input
              type="number"
              defaultValue={settings.defaultRate}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">Feature Toggles</h2>
        <div className="space-y-3">
          {[
            { key: 'aiResearch', label: 'AI Legal Research', description: 'Enable AI-powered case research' },
            { key: 'conflictCheck', label: 'Automated Conflict Checks', description: 'Run conflicts on new matter intake' },
            { key: 'trustAccounting', label: 'Trust Accounting', description: 'Enable IOLTA and trust ledger features' },
            { key: 'eSignature', label: 'E-Signature Integration', description: 'DocuSign/HelloSign integration' },
            { key: 'timeTracking', label: 'Time Tracking', description: 'Enable timesheet and billing features' },
            { key: 'documentOcr', label: 'Document OCR', description: 'Automatic text extraction from scanned documents' },
          ].map((feature) => (
            <div key={feature.key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{feature.label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{feature.description}</p>
              </div>
              <input
                type="checkbox"
                defaultChecked={settings.features?.[feature.key]}
                className="w-5 h-5 text-blue-600"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
          Cancel
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default function SystemSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">System Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure global system preferences and features</p>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading settings...</div>}>
        <SettingsForm />
      </Suspense>
    </div>
  );
}
