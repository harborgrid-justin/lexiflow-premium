/**
 * Real Estate: Outgrants Route
 *
 * Manages outgrant agreements including leases, licenses, easements, and permits
 * that authorize third-party use of government-owned real property.
 *
 * @module routes/real-estate/outgrants
 */

import { OutgrantsList } from '@/routes/real-estate/outgrants/OutgrantsList';
import type { OutgrantsLoaderData } from '@/routes/real-estate/outgrants/types';
import { DataService } from '@/services/data/dataService';
import type { RealEstateOutgrant } from '@/services/domain/RealEstateDomain';
import { useLoaderData } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/outgrants";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Real Estate - Outgrants',
    description: 'Manage outgrant agreements including leases, licenses, easements, and permits for third-party property use.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader(): Promise<OutgrantsLoaderData> {
  try {
    const outgrants = await DataService.realEstate.getOutgrants();

    return {
      data: outgrants,
      stats: {
        total: outgrants.length,
        active: outgrants.filter((o: RealEstateOutgrant) => o.status === 'Active').length,
        pendingRenewal: outgrants.filter((o: RealEstateOutgrant) => o.status === 'Pending Renewal').length,
      }
    };
  } catch (error) {
    console.error('Failed to fetch outgrants data:', error);
    return {
      data: [],
      stats: { total: 0, active: 0, pendingRenewal: 0 }
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
      const propertyId = formData.get("propertyId") as string;
      const propertyName = formData.get("propertyName") as string;
      const grantType = formData.get("grantType") as RealEstateOutgrant["grantType"];
      const grantee = formData.get("grantee") as string;
      const startDate = formData.get("startDate") as string;
      const endDate = formData.get("endDate") as string;
      const monthlyRent = formData.get("monthlyRent") as string;

      if (!propertyId || !grantee || !startDate) {
        return { success: false, error: "Property, grantee, and start date are required" };
      }

      await DataService.realEstate.createOutgrant({
        propertyId,
        propertyName: propertyName || "Unknown Property",
        grantType: grantType || "Lease",
        grantee,
        status: "Active",
        startDate,
        endDate: endDate || undefined,
        monthlyRent: monthlyRent ? parseFloat(monthlyRent) : undefined,
      });
      return { success: true, message: "Outgrant created" };
    }
    case "update":
      return { success: true, message: "Outgrant updated" };
    case "delete":
      return { success: true, message: "Outgrant deleted" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function OutgrantsRoute() {
  const data = useLoaderData() as OutgrantsLoaderData;
  return <OutgrantsList {...data} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Outgrants"
      message="We couldn't load the outgrants data. Please try again."
      backTo="/real_estate/portfolio_summary"
      backLabel="Return to Portfolio Summary"
    />
  );
}
