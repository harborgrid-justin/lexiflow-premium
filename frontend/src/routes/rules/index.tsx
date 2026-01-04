/**
 * Rules Engine Index Route
 *
 * Manage business rules, deadline calculations,
 * and automated rule-based actions.
 *
 * @module routes/rules/index
 */

import { RulesPlatform } from '@/features/knowledge/rules/RulesPlatform';
import { DataService } from '@/services/data/dataService';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Rules',
    count: data?.items?.length,
    description: 'Manage business rules and automated actions',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  try {
    const rules = await DataService.rules.getAll();
    return { items: rules, totalCount: rules.length };
  } catch (error) {
    console.error("Failed to load rules", error);
    return { items: [], totalCount: 0 };
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
      case "create": {
        const data = Object.fromEntries(formData);
        delete data.intent;
        await DataService.rules.add(data);
        return { success: true, message: "Rule created" };
      }
      case "delete": {
        const id = formData.get("id") as string;
        if (id) {
          await DataService.rules.delete(id);
          return { success: true, message: "Rule deleted" };
        }
        return { success: false, error: "ID required" };
      }
      case "enable": {
        const id = formData.get("id") as string;
        if (id) {
          await DataService.rules.update(id, { enabled: true });
          return { success: true, message: "Rule enabled" };
        }
        return { success: false, error: "ID required" };
      }
      case "disable": {
        const id = formData.get("id") as string;
        if (id) {
          await DataService.rules.update(id, { enabled: false });
          return { success: true, message: "Rule disabled" };
        }
        return { success: false, error: "ID required" };
      }
      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    return { success: false, error: "Action failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function RulesIndexRoute() {
  return <RulesPlatform />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Rules Engine"
      message="We couldn't load the rules engine. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
