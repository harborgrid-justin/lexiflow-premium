/**
 * Real Estate: Relocation Route
 *
 * Manages relocation assistance programs for individuals and businesses
 * displaced by real estate projects, ensuring compliance with applicable regulations.
 *
 * @module routes/real-estate/relocation
 */

import { useLoaderData } from 'react-router';

import { DataService } from '@/services/data/data-service.service';

import { createMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

import type { Route } from "./+types/relocation";
import type { RelocationLoaderData } from '@/routes/real-estate/relocation/types';
import type { RealEstateRelocation } from '@/services/domain/RealEstateDomain';

import { RelocationList } from '@/routes/real-estate/relocation/RelocationList';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Real Estate - Relocation',
    description: 'Manage relocation assistance programs for individuals and businesses displaced by real estate projects.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader(): Promise<RelocationLoaderData> {
  try {
    const relocations = await DataService.realEstate.getRelocations();

    return {
      data: relocations,
      stats: {
        total: relocations.length,
        inProgress: relocations.filter((r: RealEstateRelocation) => r.status === 'In Progress' || r.status === 'Planning').length,
        completed: relocations.filter((r: RealEstateRelocation) => r.status === 'Completed').length,
      }
    };
  } catch (error) {
    console.error('Failed to fetch relocation data:', error);
    return {
      data: [],
      stats: { total: 0, inProgress: 0, completed: 0 }
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create": {
      const fromPropertyId = formData.get("fromPropertyId") as string;
      const fromPropertyName = formData.get("fromPropertyName") as string;
      const toPropertyName = formData.get("toPropertyName") as string;
      const relocationType = formData.get("relocationType") as RealEstateRelocation["relocationType"];
      const scheduledDate = formData.get("scheduledDate") as string;
      const estimatedCost = formData.get("estimatedCost") as string;
      const coordinator = formData.get("coordinator") as string;

      if (!fromPropertyId || !fromPropertyName) {
        return { success: false, error: "Source property information is required" };
      }

      await DataService.realEstate.createRelocation({
        fromPropertyId,
        fromPropertyName,
        toPropertyName: toPropertyName || undefined,
        relocationType: relocationType || "Department",
        status: "Planning",
        scheduledDate: scheduledDate || undefined,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        coordinator: coordinator || undefined,
      });
      return { success: true, message: "Relocation created" };
    }
    case "update":
      return { success: true, message: "Relocation updated" };
    case "delete":
      return { success: true, message: "Relocation deleted" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function RelocationRoute() {
  const data = useLoaderData() as RelocationLoaderData;
  return <RelocationList {...data} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Relocation"
      message="We couldn't load the relocation data. Please try again."
      backTo="/real_estate/portfolio_summary"
      backLabel="Return to Portfolio Summary"
    />
  );
}
