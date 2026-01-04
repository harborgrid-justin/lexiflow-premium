/**
 * Integrations Route
 *
 * Enterprise-grade third-party integrations management with:
 * - OAuth connections
 * - API key management
 * - Webhook configuration
 * - Integration status monitoring
 *
 * @module routes/admin/integrations
 */

import { useState } from 'react';
import { Link, useFetcher } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createAdminMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createAdminMeta({
    section: 'Integrations',
    description: 'Manage third-party integrations and API connections',
  });
}

// ============================================================================
// Types
// ============================================================================

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'storage' | 'ai' | 'communication' | 'calendar' | 'billing' | 'analytics';
  status: 'connected' | 'disconnected' | 'error';
  icon: string;
  lastSync?: string;
  config?: Record<string, unknown>;
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  const integrations: Integration[] = [
    {
      id: 'google-gemini',
      name: 'Google Gemini AI',
      description: 'AI-powered legal research and document analysis',
      category: 'ai',
      status: 'connected',
      icon: '🤖',
      lastSync: new Date().toISOString(),
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Cloud document storage and synchronization',
      category: 'storage',
      status: 'disconnected',
      icon: '📁',
    },
    {
      id: 'microsoft-365',
      name: 'Microsoft 365',
      description: 'Office apps and OneDrive integration',
      category: 'storage',
      status: 'disconnected',
      icon: '📎',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and notifications',
      category: 'communication',
      status: 'disconnected',
      icon: '💬',
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Calendar sync for court dates and deadlines',
      category: 'calendar',
      status: 'disconnected',
      icon: '📅',
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Payment processing and invoicing',
      category: 'billing',
      status: 'disconnected',
      icon: '💳',
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Accounting and financial management',
      category: 'billing',
      status: 'disconnected',
      icon: '📊',
    },
    {
      id: 'mixpanel',
      name: 'Mixpanel',
      description: 'Product analytics and user tracking',
      category: 'analytics',
      status: 'disconnected',
      icon: '📈',
    },
  ];

  return { integrations };
}

// ============================================================================
// Action
// ============================================================================

import type { ActionFunctionArgs } from 'react-router';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const integrationId = formData.get("integrationId");

  switch (intent) {
    case "connect":
      // TODO: Initiate OAuth flow or API key configuration
      return { success: true, message: `Connecting to ${integrationId}...` };

    case "disconnect":
      // TODO: Revoke tokens and remove integration
      return { success: true, message: `Disconnected from ${integrationId}` };

    case "sync":
      // TODO: Trigger manual sync for integration
      return { success: true, message: `Syncing ${integrationId}...` };

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Integration Card Component
// ============================================================================

interface IntegrationCardProps {
  integration: Integration;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}

function IntegrationCard({ integration, onConnect, onDisconnect, onSync }: IntegrationCardProps) {
  const statusColors = {
    connected: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    disconnected: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-2xl dark:bg-gray-700">
            {integration.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {integration.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {integration.description}
            </p>
            {integration.lastSync && (
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                Last synced: {new Date(integration.lastSync).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[integration.status]}`}>
          {integration.status}
        </span>
      </div>
      <div className="mt-4 flex gap-2">
        {integration.status === 'connected' ? (
          <>
            <button
              type="button"
              onClick={onSync}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Sync Now
            </button>
            <button
              type="button"
              onClick={onDisconnect}
              className="flex-1 rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export default function IntegrationsRoute({ loaderData }: any) {
  const { integrations } = loaderData;
  const fetcher = useFetcher();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'ai', label: 'AI & ML' },
    { id: 'storage', label: 'Storage' },
    { id: 'communication', label: 'Communication' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'billing', label: 'Billing' },
    { id: 'analytics', label: 'Analytics' },
  ];

  const filteredIntegrations = selectedCategory === 'all'
    ? integrations
    : integrations.filter((i: { category: string; }) => i.category === selectedCategory);

  const handleConnect = (integrationId: string) => {
    fetcher.submit(
      { intent: 'connect', integrationId },
      { method: 'post' }
    );
  };

  const handleDisconnect = (integrationId: string) => {
    fetcher.submit(
      { intent: 'disconnect', integrationId },
      { method: 'post' }
    );
  };

  const handleSync = (integrationId: string) => {
    fetcher.submit(
      { intent: 'sync', integrationId },
      { method: 'post' }
    );
  };

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/admin" className="hover:text-gray-700 dark:hover:text-gray-200">
          Admin
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100">Integrations</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Integrations
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Connect LexiFlow with your favorite tools and services
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedCategory(category.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Integration Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Integrations</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {integrations.length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Connected</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {integrations.filter((i: { status: string; }) => i.status === 'connected').length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">
            {integrations.filter((i: { status: string; }) => i.status === 'disconnected').length}
          </p>
        </div>
      </div>

      {/* Integration Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations.map((integration: Integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={() => handleConnect(integration.id)}
            onDisconnect={() => handleDisconnect(integration.id)}
            onSync={() => handleSync(integration.id)}
          />
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            No integrations found in this category.
          </p>
        </div>
      )}

      {/* API Keys Section */}
      <div className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
          API Keys
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Manage API keys for programmatic access to LexiFlow.
          </p>
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Generate New API Key
          </button>
          <div className="mt-4 rounded-md bg-gray-50 p-4 dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No API keys generated yet.
            </p>
          </div>
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
          Webhooks
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Configure webhooks to receive real-time notifications about system events.
          </p>
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Webhook
          </button>
          <div className="mt-4 rounded-md bg-gray-50 p-4 dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No webhooks configured yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
