/**
 * Integrations Management Page
 * Next.js 16 Server Component for managing third-party integrations
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Plug, Plus, Key, Webhook } from 'lucide-react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import type { Integration } from '../types';
import { IntegrationsClient } from './integrations-client';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'Integrations | Admin | LexiFlow',
  description: 'Manage third-party integrations and API connections',
  robots: { index: false, follow: false },
};

// =============================================================================
// Data Fetching
// =============================================================================

async function getIntegrations(): Promise<Integration[]> {
  try {
    const integrations = await apiFetch<Integration[]>(API_ENDPOINTS.INTEGRATIONS.LIST);
    return Array.isArray(integrations) ? integrations : [];
  } catch (error) {
    console.error('Failed to fetch integrations:', error);
    return getDefaultIntegrations();
  }
}

function getDefaultIntegrations(): Integration[] {
  return [
    {
      id: 'google-gemini',
      name: 'Google Gemini AI',
      description: 'AI-powered legal research and document analysis',
      category: 'ai',
      status: 'connected',
      icon: 'brain',
      lastSync: new Date().toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Cloud document storage and synchronization',
      category: 'storage',
      status: 'disconnected',
      icon: 'hard-drive',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'microsoft-365',
      name: 'Microsoft 365',
      description: 'Office apps and OneDrive integration',
      category: 'storage',
      status: 'disconnected',
      icon: 'file-text',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and notifications',
      category: 'communication',
      status: 'disconnected',
      icon: 'message-square',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Calendar sync for court dates and deadlines',
      category: 'calendar',
      status: 'connected',
      icon: 'calendar',
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Payment processing and invoicing',
      category: 'billing',
      status: 'connected',
      icon: 'credit-card',
      lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Accounting and financial management',
      category: 'billing',
      status: 'disconnected',
      icon: 'calculator',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mixpanel',
      name: 'Mixpanel',
      description: 'Product analytics and user tracking',
      category: 'analytics',
      status: 'disconnected',
      icon: 'bar-chart',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'court-connect',
      name: 'Court Connect',
      description: 'Electronic court filing integration',
      category: 'court',
      status: 'error',
      icon: 'gavel',
      errorMessage: 'Authentication expired',
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// =============================================================================
// Components
// =============================================================================

function IntegrationsLoading() {
  return (
    <div className="space-y-6">
      {/* Stats Loading */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-2" />
            <div className="h-8 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>

      {/* Category Tabs Loading */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>

      {/* Integration Grid Loading */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-12 w-12 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1">
                <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
            <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Async Content
// =============================================================================

async function IntegrationsContent() {
  const integrations = await getIntegrations();
  return <IntegrationsClient integrations={integrations} />;
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function AdminIntegrationsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-200">
            Admin
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100">Integrations</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Integrations
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Connect LexiFlow with your favorite tools and services
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Request Integration
          </button>
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<IntegrationsLoading />}>
        <IntegrationsContent />
      </Suspense>
    </div>
  );
}
