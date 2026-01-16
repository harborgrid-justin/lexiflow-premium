/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Client CRM Route
 *
 * Client relationship management with:
 * - Server-side data loading via loader
 * - Client search and filtering
 * - Contact management
 * - Client intake actions
 *
 * @module routes/crm/index
 */

import { crmApi } from '@/lib/frontend-api';
import { DataService } from '@/services/data/data-service.service';
import { ClientStatus } from '@/types';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";
import { ClientCRM } from './components/ClientCRM';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Clients',
    count: data?.clients?.length,
    description: 'Manage client relationships and contacts',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  try {
    // Fetch all clients using new enterprise API with pagination
    const result = await crmApi.getAllClients({ page: 1, limit: 1000 });
    const clients = result.ok ? result.data.data : [];
    return {
      clients,
      recentActivity: [],
      totalCount: result.ok ? result.data.total : 0,
    };
  } catch (error) {
    // For errors, log and return empty state
    console.error("Failed to load CRM data", error);
    return {
      clients: [],
      recentActivity: [],
      totalCount: 0,
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "add-client": {
        const name = formData.get("name") as string;
        if (name) {
          await DataService.clients.add({
            name,
            status: ClientStatus.PROSPECTIVE,
          });
        }
        return { success: true, message: "Client added" };
      }

      case "update-contact": {
        const id = formData.get("id") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const address = formData.get("address") as string;

        if (!id) {
          return { success: false, error: "Contact ID is required" };
        }

        const updates: Record<string, string> = {};
        if (email) updates.email = email;
        if (phone) updates.phone = phone;
        if (address) updates.address = address;

        await DataService.clients.update(id, updates);
        return { success: true, message: "Contact updated" };
      }

      case "archive": {
        const id = formData.get("id") as string;
        if (id) {
          await DataService.clients.update(id, { status: ClientStatus.INACTIVE });
        }
        return { success: true, message: "Client archived" };
      }

      default:
        return { success: false, error: "Invalid action" };
    }
  } catch {
    return { success: false, error: "Action failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function CRMIndexRoute() {
  return <ClientCRM />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load CRM"
      message="We couldn't load the client data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
