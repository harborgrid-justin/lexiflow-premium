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

import { IntegrationsManager } from '@/routes/admin/integrations/IntegrationsManager';
import type { Integration } from '@/routes/admin/integrations/types';
import { DataService } from '@/services/data/dataService';
import { useLoaderData, type ActionFunctionArgs } from 'react-router';
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

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const integrationId = formData.get("integrationId");

  switch (intent) {
    case "connect": {
      const provider = formData.get("provider") as string;
      const apiKey = formData.get("apiKey") as string;

      if (!integrationId) {
        return { success: false, error: "Integration ID is required" };
      }

      try {
        if (apiKey) {
          await DataService.admin.integrations.connect(integrationId as string, {
            type: 'api_key',
            credentials: { apiKey },
            provider: provider || integrationId as string,
            status: 'connected',
            connectedAt: new Date().toISOString(),
          });
          return { success: true, message: `Connected to ${integrationId} successfully` };
        } else {
          const oauthUrl = `/api/integrations/${integrationId}/oauth/authorize`;
          return {
            success: true,
            message: `Initiating OAuth flow for ${integrationId}`,
            redirect: oauthUrl
          };
        }
      } catch (error) {
        console.error(`Failed to connect to ${integrationId}:`, error);
        return { success: false, error: `Failed to connect to ${integrationId}` };
      }
    }

    case "disconnect": {
      if (!integrationId) {
        return { success: false, error: "Integration ID is required" };
      }

      try {
        await DataService.admin.integrations.disconnect(integrationId as string);
        return { success: true, message: `Disconnected from ${integrationId} successfully` };
      } catch (error) {
        console.error(`Failed to disconnect from ${integrationId}:`, error);
        return { success: false, error: `Failed to disconnect from ${integrationId}` };
      }
    }

    case "sync": {
      if (!integrationId) {
        return { success: false, error: "Integration ID is required" };
      }

      try {
        const result = await DataService.admin.integrations.sync(integrationId as string, {
          fullSync: formData.get("fullSync") === "true",
          since: formData.get("since") as string || undefined,
        });

        return {
          success: true,
          message: `Synced ${result.itemsSynced || 0} items from ${integrationId}`,
          data: result
        };
      } catch (error) {
        console.error(`Failed to sync ${integrationId}:`, error);
        return { success: false, error: `Failed to sync ${integrationId}` };
      }
    }

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function IntegrationsRoute() {
  const { integrations } = useLoaderData<typeof loader>();
  return <IntegrationsManager integrations={integrations} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
