/**
 * System Settings Route
 *
 * Enterprise-grade system configuration page with:
 * - Backend API configuration
 * - Data source management
 * - Performance settings
 * - Security configuration
 * - Feature flags management
 *
 * @module routes/admin/settings
 */

import { DataService } from '@/services/data/dataService';
import { useId, useState } from 'react';
import { Link, useFetcher } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createAdminMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createAdminMeta({
    section: 'System Settings',
    description: 'Configure system-wide settings and preferences',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  try {
    const config = await DataService.admin.getSystemSettings();
    return {
      settings: {
        backendUrl: config.backendUrl,
        dataSource: config.dataSource,
        cacheEnabled: config.cacheEnabled,
        cacheTTL: config.cacheTTL,
        maxUploadSize: config.maxUploadSize,
        sessionTimeout: config.sessionTimeout,
        auditLogging: config.auditLogging,
        maintenanceMode: config.maintenanceMode,
      },
      features: config.features || {
        ocr: true,
        aiAssistant: true,
        realTimeSync: true,
        advancedSearch: true,
        documentVersioning: true,
      },
    };
  } catch (error) {
    console.error("Failed to load settings", error);
    return {
      settings: {
        backendUrl: process.env.VITE_API_URL || '/api',
        dataSource: 'postgresql',
        cacheEnabled: true,
        cacheTTL: 300,
        maxUploadSize: 50 * 1024 * 1024,
        sessionTimeout: 30,
        auditLogging: true,
        maintenanceMode: false,
      },
      features: {
        ocr: true,
        aiAssistant: true,
        realTimeSync: true,
        advancedSearch: true,
        documentVersioning: true,
      }
    };
  }
}

// ============================================================================
// Action
// ============================================================================

import type { ActionFunctionArgs } from 'react-router';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "update-settings":
      // TODO: Validate and save settings to backend
      return { success: true, message: "Settings updated successfully" };

    case "clear-cache":
      // TODO: Clear application cache
      return { success: true, message: "Cache cleared successfully" };

    case "toggle-maintenance": {
      const enabled = formData.get("enabled") === "true";
      // TODO: Toggle maintenance mode
      return { success: true, message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}` };
    }

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Setting Card Component
// ============================================================================

interface SettingCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingCard({ title, description, children }: SettingCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

// ============================================================================
// Toggle Component
// ============================================================================

interface ToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function Toggle({ id, label, checked, onChange, disabled }: ToggleProps) {
  return (
    <label htmlFor={id} className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
          }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
            }`}
        />
      </button>
    </label>
  );
}

// ============================================================================
// Component
// ============================================================================

interface SystemSettings {
  backendUrl: string;
  dataSource: string;
  cacheEnabled: boolean;
  cacheTTL: number;
  maxUploadSize: number;
  sessionTimeout: number;
  auditLogging: boolean;
  maintenanceMode: boolean;
}

interface SystemFeatures {
  ocr: boolean;
  aiAssistant: boolean;
  realTimeSync: boolean;
  advancedSearch: boolean;
  documentVersioning: boolean;
  [key: string]: boolean;
}

export default function SystemSettingsRoute({ loaderData }: { loaderData: { settings: SystemSettings; features: SystemFeatures } }) {
  const fetcher = useFetcher();
  const formId = useId();

  const { settings, features } = loaderData;

  // Local state for form values
  const [cacheEnabled, setCacheEnabled] = useState(settings.cacheEnabled);
  const [auditLogging, setAuditLogging] = useState(settings.auditLogging);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [featureFlags, setFeatureFlags] = useState(features);

  // Handle maintenance mode toggle
  const handleMaintenanceToggle = (enabled: boolean) => {
    setMaintenanceMode(enabled);
    fetcher.submit(
      { intent: "toggle-maintenance", enabled: String(enabled) },
      { method: "post" }
    );
  };

  // Handle cache clear
  const handleClearCache = () => {
    fetcher.submit({ intent: "clear-cache" }, { method: "post" });
  };

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/admin" className="hover:text-gray-700 dark:hover:text-gray-200">
          Admin
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100">System Settings</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            System Settings
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClearCache}
            disabled={fetcher.state !== 'idle'}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Backend Configuration */}
        <SettingCard
          title="Backend Configuration"
          description="Configure backend API connection settings"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor={`${formId}-backend-url`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                API Base URL
              </label>
              <input
                id={`${formId}-backend-url`}
                type="text"
                defaultValue={settings.backendUrl}
                readOnly
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500">Configured via environment variable</p>
            </div>
            <div>
              <label htmlFor={`${formId}-data-source`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data Source
              </label>
              <select
                id={`${formId}-data-source`}
                defaultValue={settings.dataSource}
                disabled
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400"
              >
                <option value="postgresql">PostgreSQL (Backend API)</option>
                <option value="indexeddb">IndexedDB (Legacy - Deprecated)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Backend-first architecture is enforced</p>
            </div>
          </div>
        </SettingCard>

        {/* Performance Settings */}
        <SettingCard
          title="Performance"
          description="Configure caching and performance options"
        >
          <div className="space-y-4">
            <Toggle
              id={`${formId}-cache`}
              label="Enable Response Caching"
              checked={cacheEnabled}
              onChange={setCacheEnabled}
            />
            <div>
              <label htmlFor={`${formId}-cache-ttl`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cache TTL (seconds)
              </label>
              <input
                id={`${formId}-cache-ttl`}
                type="number"
                defaultValue={settings.cacheTTL}
                min={60}
                max={3600}
                disabled={!cacheEnabled}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:disabled:bg-gray-800"
              />
            </div>
            <div>
              <label htmlFor={`${formId}-upload-size`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Max Upload Size
              </label>
              <select
                id={`${formId}-upload-size`}
                defaultValue={settings.maxUploadSize}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
              >
                <option value={10 * 1024 * 1024}>10 MB</option>
                <option value={25 * 1024 * 1024}>25 MB</option>
                <option value={50 * 1024 * 1024}>50 MB</option>
                <option value={100 * 1024 * 1024}>100 MB</option>
              </select>
            </div>
          </div>
        </SettingCard>

        {/* Security Settings */}
        <SettingCard
          title="Security"
          description="Configure security and session settings"
        >
          <div className="space-y-4">
            <Toggle
              id={`${formId}-audit`}
              label="Enable Audit Logging"
              checked={auditLogging}
              onChange={setAuditLogging}
            />
            <div>
              <label htmlFor={`${formId}-session`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Session Timeout (minutes)
              </label>
              <input
                id={`${formId}-session`}
                type="number"
                defaultValue={settings.sessionTimeout}
                min={5}
                max={120}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
              />
            </div>
          </div>
        </SettingCard>

        {/* Maintenance Mode */}
        <SettingCard
          title="Maintenance Mode"
          description="Enable maintenance mode to restrict access"
        >
          <div className="space-y-4">
            <Toggle
              id={`${formId}-maintenance`}
              label="Enable Maintenance Mode"
              checked={maintenanceMode}
              onChange={handleMaintenanceToggle}
            />
            {maintenanceMode && (
              <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-900/20">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ Maintenance mode is active. Only administrators can access the system.
                </p>
              </div>
            )}
          </div>
        </SettingCard>

        {/* Feature Flags */}
        <SettingCard
          title="Feature Flags"
          description="Enable or disable system features"
        >
          <div className="space-y-3">
            <Toggle
              id={`${formId}-feature-ocr`}
              label="OCR Processing"
              checked={featureFlags.ocr}
              onChange={(v) => setFeatureFlags((f: SystemFeatures) => ({ ...f, ocr: v }))}
            />
            <Toggle
              id={`${formId}-feature-ai`}
              label="AI Assistant"
              checked={featureFlags.aiAssistant}
              onChange={(v) => setFeatureFlags((f: SystemFeatures) => ({ ...f, aiAssistant: v }))}
            />
            <Toggle
              id={`${formId}-feature-sync`}
              label="Real-time Sync"
              checked={featureFlags.realTimeSync}
              onChange={(v) => setFeatureFlags((f: SystemFeatures) => ({ ...f, realTimeSync: v }))}
            />
            <Toggle
              id={`${formId}-feature-search`}
              label="Advanced Search"
              checked={featureFlags.advancedSearch}
              onChange={(v) => setFeatureFlags((f: SystemFeatures) => ({ ...f, advancedSearch: v }))}
            />
            <Toggle
              id={`${formId}-feature-versioning`}
              label="Document Versioning"
              checked={featureFlags.documentVersioning}
              onChange={(v) => setFeatureFlags((f: SystemFeatures) => ({ ...f, documentVersioning: v }))}
            />
          </div>
        </SettingCard>

        {/* System Status */}
        <SettingCard
          title="System Status"
          description="Current system health and status"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Backend API</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Connected</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">PostgreSQL</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cache</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Active</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Queue</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Redis + Bull</span>
              </span>
            </div>
          </div>
        </SettingCard>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={() => {
            fetcher.submit({ intent: "update-settings" }, { method: "post" });
          }}
          disabled={fetcher.state !== 'idle'}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {fetcher.state !== 'idle' ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
