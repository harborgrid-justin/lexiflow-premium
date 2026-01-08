'use client';

/**
 * Settings Client Component
 * Handles interactive settings management
 */

import { useState, useId, useTransition } from 'react';
import { Settings, Server, Shield, Zap, AlertTriangle, Check, Loader2 } from 'lucide-react';
import type { SystemSettings, FeatureFlags } from '../types';
import { updateSystemSettings, toggleMaintenanceMode, clearSystemCache } from '../actions';

interface SettingsClientProps {
  settings: SystemSettings;
  features: FeatureFlags;
}

// =============================================================================
// Toggle Component
// =============================================================================

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
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

// =============================================================================
// Setting Card Component
// =============================================================================

interface SettingCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingCard({ icon, title, description, children }: SettingCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-slate-400">{icon}</div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        {description}
      </p>
      <div>{children}</div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function SettingsClient({ settings, features }: SettingsClientProps) {
  const formId = useId();
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Local state for form values
  const [cacheEnabled, setCacheEnabled] = useState(settings.cacheEnabled);
  const [cacheTTL, setCacheTTL] = useState(settings.cacheTTL);
  const [auditLogging, setAuditLogging] = useState(settings.auditLogging);
  const [sessionTimeout, setSessionTimeout] = useState(settings.sessionTimeout);
  const [maxUploadSize, setMaxUploadSize] = useState(settings.maxUploadSize);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [featureFlags, setFeatureFlags] = useState(features);

  // Handle maintenance mode toggle
  const handleMaintenanceToggle = async (enabled: boolean) => {
    setMaintenanceMode(enabled);
    startTransition(async () => {
      const result = await toggleMaintenanceMode(enabled);
      if (!result.success) {
        setMaintenanceMode(!enabled); // Revert on error
      }
    });
  };

  // Handle cache clear
  const handleClearCache = async () => {
    startTransition(async () => {
      await clearSystemCache();
    });
  };

  // Handle save
  const handleSave = async () => {
    setSaveStatus('saving');
    startTransition(async () => {
      const updatedSettings: SystemSettings = {
        ...settings,
        cacheEnabled,
        cacheTTL,
        auditLogging,
        sessionTimeout,
        maxUploadSize,
        maintenanceMode,
      };

      const result = await updateSystemSettings(updatedSettings);
      if (result.success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Settings Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Backend Configuration */}
        <SettingCard
          icon={<Server className="h-5 w-5" />}
          title="Backend Configuration"
          description="Configure backend API connection settings"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor={`${formId}-backend-url`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                API Base URL
              </label>
              <input
                id={`${formId}-backend-url`}
                type="text"
                defaultValue={settings.backendUrl}
                readOnly
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm"
              />
              <p className="mt-1 text-xs text-slate-500">Configured via environment variable</p>
            </div>
            <div>
              <label htmlFor={`${formId}-data-source`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Data Source
              </label>
              <select
                id={`${formId}-data-source`}
                defaultValue={settings.dataSource}
                disabled
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm"
              >
                <option value="postgresql">PostgreSQL (Backend API)</option>
                <option value="mongodb">MongoDB</option>
                <option value="mysql">MySQL</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">Backend-first architecture is enforced</p>
            </div>
          </div>
        </SettingCard>

        {/* Performance Settings */}
        <SettingCard
          icon={<Zap className="h-5 w-5" />}
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
              <label htmlFor={`${formId}-cache-ttl`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Cache TTL (seconds)
              </label>
              <input
                id={`${formId}-cache-ttl`}
                type="number"
                value={cacheTTL}
                onChange={(e) => setCacheTTL(parseInt(e.target.value) || 300)}
                min={60}
                max={3600}
                disabled={!cacheEnabled}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-slate-800"
              />
            </div>
            <div>
              <label htmlFor={`${formId}-upload-size`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Max Upload Size
              </label>
              <select
                id={`${formId}-upload-size`}
                value={maxUploadSize}
                onChange={(e) => setMaxUploadSize(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
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
          icon={<Shield className="h-5 w-5" />}
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
              <label htmlFor={`${formId}-session`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Session Timeout (minutes)
              </label>
              <input
                id={`${formId}-session`}
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(parseInt(e.target.value) || 30)}
                min={5}
                max={120}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </SettingCard>

        {/* Maintenance Mode */}
        <SettingCard
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Maintenance Mode"
          description="Enable maintenance mode to restrict access"
        >
          <div className="space-y-4">
            <Toggle
              id={`${formId}-maintenance`}
              label="Enable Maintenance Mode"
              checked={maintenanceMode}
              onChange={handleMaintenanceToggle}
              disabled={isPending}
            />
            {maintenanceMode && (
              <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-3 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Maintenance mode is active. Only administrators can access the system.
                </p>
              </div>
            )}
          </div>
        </SettingCard>

        {/* Feature Flags */}
        <SettingCard
          icon={<Settings className="h-5 w-5" />}
          title="Feature Flags"
          description="Enable or disable system features"
        >
          <div className="space-y-3">
            <Toggle
              id={`${formId}-feature-ocr`}
              label="OCR Processing"
              checked={featureFlags.ocr}
              onChange={(v) => setFeatureFlags((f) => ({ ...f, ocr: v }))}
            />
            <Toggle
              id={`${formId}-feature-ai`}
              label="AI Assistant"
              checked={featureFlags.aiAssistant}
              onChange={(v) => setFeatureFlags((f) => ({ ...f, aiAssistant: v }))}
            />
            <Toggle
              id={`${formId}-feature-sync`}
              label="Real-time Sync"
              checked={featureFlags.realTimeSync}
              onChange={(v) => setFeatureFlags((f) => ({ ...f, realTimeSync: v }))}
            />
            <Toggle
              id={`${formId}-feature-search`}
              label="Advanced Search"
              checked={featureFlags.advancedSearch}
              onChange={(v) => setFeatureFlags((f) => ({ ...f, advancedSearch: v }))}
            />
            <Toggle
              id={`${formId}-feature-versioning`}
              label="Document Versioning"
              checked={featureFlags.documentVersioning}
              onChange={(v) => setFeatureFlags((f) => ({ ...f, documentVersioning: v }))}
            />
          </div>
        </SettingCard>

        {/* System Status */}
        <SettingCard
          icon={<Server className="h-5 w-5" />}
          title="System Status"
          description="Current system health and status"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Backend API</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Connected</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Database</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">PostgreSQL</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Cache</span>
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${cacheEnabled ? 'bg-green-500' : 'bg-slate-400'}`} />
                <span className={`text-sm font-medium ${cacheEnabled ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>
                  {cacheEnabled ? 'Active' : 'Disabled'}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Queue</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Redis + Bull</span>
              </span>
            </div>
          </div>
        </SettingCard>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || saveStatus === 'saving'}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {saveStatus === 'saving' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
}
