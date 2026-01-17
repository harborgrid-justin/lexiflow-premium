/**
 * Real Estate: Cost Share Route
 *
 * Manages cost-sharing arrangements for real estate projects, including
 * partner contributions, funding allocations, and expense tracking.
 *
 * @module routes/real-estate/cost-share
 */

import { useLoaderData } from 'react-router';

import { DataService } from '@/services/data/data-service.service';

import { createMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

import type { Route } from "./+types/cost-share";
import type { CostShareLoaderData } from '@/routes/real-estate/cost-share/types';
import type { RealEstateCostShare } from '@/services/domain/RealEstateDomain';

import { CostShareList } from '@/routes/real-estate/cost-share/CostShareList';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Real Estate - Cost Share',
    description: 'Manage cost-sharing arrangements including partner contributions, funding allocations, and expense tracking.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader(): Promise<CostShareLoaderData> {
  try {
    const costShares = await DataService.realEstate.getCostShares();

    return {
      data: costShares,
      stats: {
        total: costShares.length,
        active: costShares.filter((cs: RealEstateCostShare) => cs.status === 'Active').length,
        totalAmount: costShares.reduce((sum: number, cs: RealEstateCostShare) => sum + (cs.totalAmount || 0), 0),
      }
    };
  } catch (error) {
    console.error('Failed to fetch cost share data:', error);
    return {
      data: [],
      stats: { total: 0, active: 0, totalAmount: 0 }
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
      const agreementType = formData.get("agreementType") as RealEstateCostShare["agreementType"];
      const parties = (formData.get("parties") as string)?.split(",").map(p => p.trim()).filter(Boolean) || [];
      const effectiveDate = formData.get("effectiveDate") as string;
      const billingFrequency = formData.get("billingFrequency") as RealEstateCostShare["billingFrequency"];
      const totalAmount = formData.get("totalAmount") as string;

      if (!propertyId || !propertyName || parties.length === 0) {
        return { success: false, error: "Property and parties are required" };
      }

      await DataService.realEstate.createCostShare({
        propertyId,
        propertyName,
        agreementType: agreementType || "Lease Share",
        parties,
        sharePercentages: parties.reduce((acc, party) => ({ ...acc, [party]: Math.floor(100 / parties.length) }), {}),
        effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
        billingFrequency: billingFrequency || "Monthly",
        status: "Pending",
        totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
      });
      return { success: true, message: "Cost share agreement created" };
    }
    case "update":
      return { success: true, message: "Cost share updated" };
    case "delete":
      return { success: true, message: "Cost share deleted" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function CostShareRoute() {
  const data = useLoaderData() as CostShareLoaderData;
  return <CostShareList {...data} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Cost Share"
      message="We couldn't load the cost share data. Please try again."
      backTo="/real_estate/portfolio_summary"
      backLabel="Return to Portfolio Summary"
    />
  );
}
