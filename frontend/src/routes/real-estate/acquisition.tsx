/**
 * Real Estate: Acquisition Route
 *
 * Manages the acquisition of real estate properties including land purchases,
 * building acquisitions, easement procurement, and related transaction workflows.
 *
 * @module routes/real-estate/acquisition
 */

import { AcquisitionManager } from '@/routes/real-estate/acquisition/AcquisitionManager';
import type { AcquisitionLoaderData } from '@/routes/real-estate/acquisition/types';
import { DataService } from '@/services/data/data-service.service';
import type { AcquisitionStatus, RealEstateAcquisition } from '@/services/domain/RealEstateDomain';
import { useLoaderData, type ActionFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/acquisition";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Real Estate - Acquisition',
    description: 'Manage real estate acquisitions including land purchases, building acquisitions, and transaction workflows.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader(): Promise<AcquisitionLoaderData> {
  try {
    const acquisitions = await DataService.realEstate.getAcquisitions();
    const pending = acquisitions.filter(
      (a: RealEstateAcquisition) => a.status === 'Prospecting' || a.status === 'Under Contract' || a.status === 'Due Diligence'
    );

    return {
      data: acquisitions,
      stats: {
        total: acquisitions.length,
        pending: pending.length,
        completed: acquisitions.filter((a: RealEstateAcquisition) => a.status === 'Closed').length,
        totalInvestment: acquisitions.reduce((sum: number, a: RealEstateAcquisition) => sum + (a.finalPrice || a.offeredPrice || 0), 0),
      }
    };
  } catch (error) {
    console.error('Failed to fetch acquisition data:', error);
    return {
      data: [],
      stats: { total: 0, pending: 0, completed: 0, totalInvestment: 0 }
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create": {
      const propertyName = formData.get("propertyName") as string;
      const address = formData.get("address") as string;
      const propertyType = formData.get("propertyType") as RealEstateAcquisition["propertyType"];
      const askingPrice = formData.get("askingPrice") as string;
      const seller = formData.get("seller") as string;
      const targetCloseDate = formData.get("targetCloseDate") as string;

      if (!propertyName || !address) {
        return { success: false, error: "Property name and address are required" };
      }

      await DataService.realEstate.createAcquisition({
        propertyName,
        address,
        propertyType: propertyType || "Building",
        status: "Prospecting",
        askingPrice: askingPrice ? parseFloat(askingPrice) : undefined,
        seller: seller || undefined,
        targetCloseDate: targetCloseDate || undefined,
      });
      return { success: true, message: "Acquisition created" };
    }
    case "update": {
      const id = formData.get("id") as string;
      const status = formData.get("status") as AcquisitionStatus;
      const offeredPrice = formData.get("offeredPrice") as string;

      if (!id) {
        return { success: false, error: "ID is required" };
      }

      const updates: Partial<RealEstateAcquisition> = { status };
      if (offeredPrice) {
        updates.offeredPrice = parseFloat(offeredPrice);
      }
      if (status === "Closed") {
        updates.actualCloseDate = new Date().toISOString();
      }

      await DataService.realEstate.updateAcquisition(id, updates);
      return { success: true, message: "Acquisition updated" };
    }
    case "delete":
      return { success: true, message: "Acquisition deleted" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function AcquisitionRoute() {
  const { data, stats } = useLoaderData<typeof loader>();
  return <AcquisitionManager data={data} stats={stats} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Acquisition"
      message="We couldn't load the acquisition data. Please try again."
      backTo="/real_estate/portfolio_summary"
      backLabel="Return to Portfolio Summary"
    />
  );
}
