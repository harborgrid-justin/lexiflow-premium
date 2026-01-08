"use server";

/**
 * Inventory Server Actions
 *
 * @module app/(main)/real-estate/inventory/actions
 */

import { revalidateTag } from "next/cache";
import {
  createProperty,
  updateProperty,
  deleteProperty,
  REAL_ESTATE_TAGS,
  type PropertyType,
  type PropertyStatus,
} from "@/lib/dal/real-estate";

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function createPropertyAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zipCode = formData.get("zipCode") as string;
    const country = formData.get("country") as string;
    const propertyType = formData.get("propertyType") as PropertyType;
    const squareFootage = formData.get("squareFootage") as string;
    const currentValue = formData.get("currentValue") as string;

    if (!name || !address || !city || !state) {
      return { success: false, error: "Name, address, city, and state are required" };
    }

    await createProperty({
      name,
      address,
      city,
      state,
      zipCode: zipCode || "",
      country: country || "USA",
      propertyType: propertyType || "Building",
      status: "Active",
      squareFootage: squareFootage ? parseInt(squareFootage, 10) : undefined,
      currentValue: currentValue ? parseFloat(currentValue) : undefined,
    });

    revalidateTag(REAL_ESTATE_TAGS.PROPERTIES);
    revalidateTag(REAL_ESTATE_TAGS.STATS);

    return { success: true, message: "Property created successfully" };
  } catch (error) {
    console.error("Failed to create property:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create property",
    };
  }
}

export async function updatePropertyAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const id = formData.get("id") as string;
    const status = formData.get("status") as PropertyStatus;
    const currentValue = formData.get("currentValue") as string;

    if (!id) {
      return { success: false, error: "ID is required" };
    }

    const updates: Partial<{ status: PropertyStatus; currentValue: number }> = {};
    if (status) updates.status = status;
    if (currentValue) updates.currentValue = parseFloat(currentValue);

    await updateProperty(id, updates);

    revalidateTag(REAL_ESTATE_TAGS.PROPERTIES);
    revalidateTag(REAL_ESTATE_TAGS.STATS);

    return { success: true, message: "Property updated successfully" };
  } catch (error) {
    console.error("Failed to update property:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update property",
    };
  }
}

export async function deletePropertyAction(id: string): Promise<ActionResult> {
  try {
    await deleteProperty(id);

    revalidateTag(REAL_ESTATE_TAGS.PROPERTIES);
    revalidateTag(REAL_ESTATE_TAGS.STATS);

    return { success: true, message: "Property deleted successfully" };
  } catch (error) {
    console.error("Failed to delete property:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete property",
    };
  }
}
