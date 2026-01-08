'use client';

/**
 * Integrations Client Component
 * Handles interactive integration management
 */

import { useState, useMemo, useTransition } from 'react';
import {
  RefreshCw, Link as LinkIcon, Unlink, AlertTriangle,
  Brain, HardDrive, MessageSquare, Calendar, CreditCard,
  BarChart, Calculator, FileText, Gavel, Plug, Key, Webhook, Plus
} from 'lucide-react';
import type { Integration, IntegrationCategory, IntegrationStatus } from '../types';
import { connectIntegration, disconnectIntegration, syncIntegration } from '../actions';

interface IntegrationsClientProps {
  integrations: Integration[];
}

// =============================================================================
// Icon Mapping
// =============================================================================

function getIntegrationIcon(iconName: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    brain: <Brain className="h-6 w-6" />,
    'hard-drive': <HardDrive className="h-6 w-6" />,
    'file-text': <FileText className="h-6 w-6" />,
    'message-square': <MessageSquare className="h-6 w-6" />,
    calendar: <Calendar className="h-6 w-6" />,
    'credit-card': <CreditCard className="h-6 w-6" />,
    calculator: <Calculator className="h-6 w-6" />,
    'bar-chart': <BarChart className="h-6 w-6" />,
    gavel: <Gavel className="h-6 w-6" />,
  };
  return icons[iconName] || <Plug className="h-6 w-6" />;
}

// =============================================================================
// Status Badge Component
// =============================================================================

function StatusBadge({ status }: { status: IntegrationStatus }) {
  const statusStyles: Record<IntegrationStatus, string> = {
    connected: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    disconnected: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// =============================================================================
// Integration Card Component
// =============================================================================

interface IntegrationCardProps {
  integration: Integration;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  isPending: boolean;
}

function IntegrationCard({ integration, onConnect, onDisconnect, onSync, isPending }: IntegrationCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {getIntegrationIcon(integration.icon)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {integration.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {integration.description}
            </p>
          </div>
        </div>
        <StatusBadge status={integration.status} />
      </div>

      {integration.lastSync && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
          Last synced: {new Date(integration.lastSync).toLocaleString()}
        </p>
      )}

      {integration.errorMessage && integration.status === 'error' && (
        <div className="mb-4 p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {integration.errorMessage}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {integration.status === 'connected' ? (
          <>
            <button
              type="button"
              onClick={onSync}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
              Sync
            </button>
            <button
              type="button"
              onClick={onDisconnect}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
            >
              <Unlink className="h-4 w-4" />
              Disconnect
            </button>
          </>
        ) : integration.status === 'error' ? (
          <>
            <button
              type="button"
              onClick={onConnect}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <LinkIcon className="h-4 w-4" />
              Reconnect
            </button>
            <button
              type="button"
              onClick={onDisconnect}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              <Unlink className="h-4 w-4" />
              Remove
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <LinkIcon className="h-4 w-4" />
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function IntegrationsClient({ integrations }: IntegrationsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'ai', label: 'AI & ML' },
    { id: 'storage', label: 'Storage' },
    { id: 'communication', label: 'Communication' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'billing', label: 'Billing' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'court', label: 'Court Systems' },
  ];

  const filteredIntegrations = useMemo(() => {
    return selectedCategory === 'all'
      ? integrations
      : integrations.filter((i) => i.category === selectedCategory);
  }, [integrations, selectedCategory]);

  const stats = useMemo(() => ({
    total: integrations.length,
    connected: integrations.filter((i) => i.status === 'connected').length,
    disconnected: integrations.filter((i) => i.status === 'disconnected').length,
    errors: integrations.filter((i) => i.status === 'error').length,
  }), [integrations]);

  const handleConnect = (integrationId: string) => {
    startTransition(async () => {
      await connectIntegration(integrationId, {});
    });
  };

  const handleDisconnect = (integrationId: string) => {
    startTransition(async () => {
      await disconnectIntegration(integrationId);
    });
  };

  const handleSync = (integrationId: string) => {
    startTransition(async () => {
      await syncIntegration(integrationId);
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Integrations</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Connected</p>
          <p className="text-2xl font-bold text-green-600">{stats.connected}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Available</p>
          <p className="text-2xl font-bold text-slate-600">{stats.disconnected}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Errors</p>
          <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Integration Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={() => handleConnect(integration.id)}
            onDisconnect={() => handleDisconnect(integration.id)}
            onSync={() => handleSync(integration.id)}
            isPending={isPending}
          />
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <Plug className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
            No integrations found
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            No integrations available in this category
          </p>
        </div>
      )}

      {/* API Keys Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Manage API keys for programmatic access to LexiFlow.
          </p>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Generate New API Key
          </button>
          <div className="mt-4 p-4 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No API keys generated yet.
            </p>
          </div>
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhooks
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Configure webhooks to receive real-time notifications about system events.
          </p>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Webhook
          </button>
          <div className="mt-4 p-4 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No webhooks configured yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
