/**
 * System Settings Page
 * Next.js 16 Server Component for configuring system-wide settings
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Settings, Server, Shield, Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import type { SystemSettings, FeatureFlags } from '../types';
import { SettingsClient } from './settings-client';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'System Settings | Admin | LexiFlow',
  description: 'Configure system-wide settings and preferences',
  robots: { index: false, follow: false },
};

// =============================================================================
// Data Fetching
// =============================================================================

async function getSystemSettings(): Promise<{ settings: SystemSettings; features: FeatureFlags }> {
  try {
    const config = await apiFetch<{
      backendUrl: string;
      dataSource: string;
      cacheEnabled: boolean;
      cacheTTL: number;
      maxUploadSize: number;
      sessionTimeout: number;
      auditLogging: boolean;
      maintenanceMode: boolean;
      features?: FeatureFlags;
    }>(API_ENDPOINTS.SETTINGS.GET);

    return {
      settings: {
        backendUrl: config.backendUrl,
        dataSource: config.dataSource as 'postgresql' | 'mongodb' | 'mysql',
        cacheEnabled: config.cacheEnabled,
        cacheTTL: config.cacheTTL,
        maxUploadSize: config.maxUploadSize,
        sessionTimeout: config.sessionTimeout,
        auditLogging: config.auditLogging,
        maintenanceMode: config.maintenanceMode,
      },
      features: config.features || getDefaultFeatures(),
    };
  } catch (error) {
    console.error('Failed to fetch system settings:', error);
    return { settings: getDefaultSettings(), features: getDefaultFeatures() };
  }
}

function getDefaultSettings(): SystemSettings {
  return {
    backendUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    dataSource: 'postgresql',
    cacheEnabled: true,
    cacheTTL: 300,
    maxUploadSize: 50 * 1024 * 1024,
    sessionTimeout: 30,
    auditLogging: true,
    maintenanceMode: false,
  };
}

function getDefaultFeatures(): FeatureFlags {
  return {
    ocr: true,
    aiAssistant: true,
    realTimeSync: true,
    advancedSearch: true,
    documentVersioning: true,
  };
}

// =============================================================================
// Components
// =============================================================================

function SettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Settings Grid Loading */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-2" />
            <div className="h-4 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
            <div className="space-y-3">
              <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Async Content
// =============================================================================

async function SettingsContent() {
  const { settings, features } = await getSystemSettings();
  return <SettingsClient settings={settings} features={features} />;
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function AdminSettingsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-200">
            Admin
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100">System Settings</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              System Settings
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Configure system-wide settings and preferences
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Clear Cache
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<SettingsLoading />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
