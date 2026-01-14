/**
 * Real Estate: Inventory Route
 *
 * Manages the complete inventory of real estate assets including land parcels,
 * buildings, facilities, and other property holdings with detailed records.
 *
 * @module routes/real-estate/inventory
 */

import { InventoryList } from '@/routes/real-estate/inventory/InventoryList';
import type { InventoryLoaderData } from '@/routes/real-estate/inventory/types';
import { DataService } from '@/services/data/data-service.service';
import type { PropertyStatus, RealEstateProperty } from '@/services/domain/RealEstateDomain';
import { useLoaderData } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/inventory";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Real Estate - Inventory',
    description: 'Manage complete inventory of real estate assets including land parcels, buildings, and facilities.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader(): Promise<InventoryLoaderData> {
  try {
    const properties = await DataService.realEstate.getAllProperties();

    return {
      data: properties,
      stats: {
        total: properties.length,
        active: properties.filter((p: RealEstateProperty) => p.status === 'Active').length,
        pending: properties.filter((p: RealEstateProperty) => p.status === 'Pending' || p.status === 'Under Review').length,
      }
    };
  } catch (error) {
    console.error('Failed to fetch inventory data:', error);
    return {
      data: [],
      stats: { total: 0, active: 0, pending: 0 }
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
      const name = formData.get("name") as string;
      const address = formData.get("address") as string;
      const city = formData.get("city") as string;
      const state = formData.get("state") as string;
      const zipCode = formData.get("zipCode") as string;
      const propertyType = formData.get("propertyType") as RealEstateProperty["propertyType"];
      const squareFootage = formData.get("squareFootage") as string;

      if (!name || !address || !city || !state || !zipCode) {
        return { success: false, error: "Name, address, city, state, and zip code are required" };
      }

      await DataService.realEstate.createProperty({
        name,
        address,
        city,
        state,
        zipCode,
        country: "USA",
        propertyType: propertyType || "Building",
        status: "Pending",
        squareFootage: squareFootage ? parseFloat(squareFootage) : undefined,
      });
      return { success: true, message: "Property created" };
    }
    case "update": {
      const id = formData.get("id") as string;
      const status = formData.get("status") as PropertyStatus;

      if (!id) {
        return { success: false, error: "ID is required" };
      }

      await DataService.realEstate.updateProperty(id, { status });
      return { success: true, message: "Property updated" };
    }
    case "delete": {
      const id = formData.get("id") as string;
      if (!id) {
        return { success: false, error: "ID is required" };
      }
      await DataService.realEstate.deleteProperty(id);
      return { success: true, message: "Property deleted" };
    }
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function InventoryRoute() {
  const data = useLoaderData() as InventoryLoaderData;
  return <InventoryList {...data} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Inventory"
      message="We couldn't load the inventory data. Please try again."
      backTo="/real_estate/portfolio_summary"
      backLabel="Return to Portfolio Summary"
    />
  );
}
