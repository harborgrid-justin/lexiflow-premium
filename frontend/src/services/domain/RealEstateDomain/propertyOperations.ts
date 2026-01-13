/**
 * RealEstateDomain - Property Operations
 * CRUD operations for property inventory management
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import type { PropertyStatus, RealEstateProperty } from "./types";

/**
 * Get all properties in the portfolio
 */
export async function getAllProperties(filters?: {
  status?: PropertyStatus;
  propertyType?: string;
  state?: string;
}): Promise<RealEstateProperty[]> {
  try {
    return await apiClient.get<RealEstateProperty[]>(
      "/real-estate/properties",
      { params: filters }
    );
  } catch (error) {
    console.error("[RealEstateService.getAllProperties] Error:", error);
    return [];
  }
}

/**
 * Get a single property by ID
 */
export async function getPropertyById(
  id: string
): Promise<RealEstateProperty | null> {
  if (!id?.trim()) {
    console.error("[RealEstateService.getPropertyById] Invalid ID");
    return null;
  }

  try {
    return await apiClient.get<RealEstateProperty>(
      `/real-estate/properties/${id}`
    );
  } catch (error) {
    console.error("[RealEstateService.getPropertyById] Error:", error);
    return null;
  }
}

/**
 * Create a new property record
 */
export async function createProperty(
  property: Omit<RealEstateProperty, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateProperty> {
  return apiClient.post<RealEstateProperty>(
    "/real-estate/properties",
    property
  );
}

/**
 * Update an existing property
 */
export async function updateProperty(
  id: string,
  updates: Partial<RealEstateProperty>
): Promise<RealEstateProperty> {
  return apiClient.patch<RealEstateProperty>(
    `/real-estate/properties/${id}`,
    updates
  );
}

/**
 * Delete a property record
 */
export async function deleteProperty(id: string): Promise<void> {
  return apiClient.delete(`/real-estate/properties/${id}`);
}
