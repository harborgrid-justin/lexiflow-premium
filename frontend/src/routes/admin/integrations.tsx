/**
 * Integrations Route
 *
 * Enterprise-grade third-party integrations management with:
 * - OAuth connections
 * - API key management
 * - Webhook configuration
 * - Integration status monitoring
 *
 * Enterprise API Pattern:
 * - Uses @/lib/frontend-api/integrations
 * - Handles Result<T> returns
 * - Real-time sync status
 *
 * @module routes/admin/integrations
 */

import { useLoaderData, type ActionFunctionArgs } from 'react-router';

import { integrationsApi } from '@/lib/frontend-api';
import { IntegrationsManager } from '@/routes/admin/integrations/IntegrationsManager';

import { createAdminMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

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

/**
 * Load integrations from enterprise API
 */
export async function loader() {
  try {
    // Fetch integrations using new enterprise API
    const result = await integrationsApi.getAllIntegrations({
      page: 1,
      limit: 100,
    });

    if (result.ok) {
      return { integrations: result.data.data || [] };
    }

    // Fallback to empty list if API call fails
    console.warn("Failed to load integrations from API, using empty list");
    return { integrations: [] };
  } catch (error) {
    console.error("Failed to load integrations:", error);
    return { integrations: [] };
  }
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
