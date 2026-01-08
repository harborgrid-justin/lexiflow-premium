"use server";

/**
 * Acquisition Server Actions
 *
 * Server-side mutations for acquisition management.
 *
 * Next.js 16 Compliance:
 * - "use server" directive
 * - revalidateTag with profile parameter
 * - Type-safe form data handling
 *
 * @module app/(main)/real-estate/acquisition/actions
 */

import { revalidateTag } from "next/cache";
import {
  createAcquisition,
  updateAcquisition,
  REAL_ESTATE_TAGS,
  type AcquisitionStatus,
  type PropertyType,
} from "@/lib/dal/real-estate";

// ============================================================================
// Types
// ============================================================================

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

// ============================================================================
// Actions
// ============================================================================

export async function createAcquisitionAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const propertyName = formData.get("propertyName") as string;
    const address = formData.get("address") as string;
    const propertyType = formData.get("propertyType") as PropertyType;
    const askingPrice = formData.get("askingPrice") as string;
    const seller = formData.get("seller") as string;
    const targetCloseDate = formData.get("targetCloseDate") as string;

    if (!propertyName || !address) {
      return {
        success: false,
        error: "Property name and address are required",
      };
    }

    await createAcquisition({
      propertyName,
      address,
      propertyType: propertyType || "Building",
      status: "Prospecting",
      askingPrice: askingPrice ? parseFloat(askingPrice) : undefined,
      seller: seller || undefined,
      targetCloseDate: targetCloseDate || undefined,
    });

    // Revalidate with profile parameter (Next.js 16 requirement)
    revalidateTag(REAL_ESTATE_TAGS.ACQUISITIONS);
    revalidateTag(REAL_ESTATE_TAGS.STATS);

    return { success: true, message: "Acquisition created successfully" };
  } catch (error) {
    console.error("Failed to create acquisition:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create acquisition",
    };
  }
}

export async function updateAcquisitionAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const id = formData.get("id") as string;
    const status = formData.get("status") as AcquisitionStatus;
    const offeredPrice = formData.get("offeredPrice") as string;

    if (!id) {
      return { success: false, error: "ID is required" };
    }

    const updates: Partial<{
      status: AcquisitionStatus;
      offeredPrice: number;
      actualCloseDate: string;
    }> = {};

    if (status) {
      updates.status = status;
      if (status === "Closed") {
        updates.actualCloseDate = new Date().toISOString();
      }
    }

    if (offeredPrice) {
      updates.offeredPrice = parseFloat(offeredPrice);
    }

    await updateAcquisition(id, updates);

    revalidateTag(REAL_ESTATE_TAGS.ACQUISITIONS);
    revalidateTag(REAL_ESTATE_TAGS.STATS);

    return { success: true, message: "Acquisition updated successfully" };
  } catch (error) {
    console.error("Failed to update acquisition:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update acquisition",
    };
  }
}

export async function updateAcquisitionStatusAction(
  id: string,
  status: AcquisitionStatus
): Promise<ActionResult> {
  try {
    const updates: Partial<{
      status: AcquisitionStatus;
      actualCloseDate: string;
    }> = { status };

    if (status === "Closed") {
      updates.actualCloseDate = new Date().toISOString();
    }

    await updateAcquisition(id, updates);

    revalidateTag(REAL_ESTATE_TAGS.ACQUISITIONS);
    revalidateTag(REAL_ESTATE_TAGS.STATS);

    return { success: true, message: "Status updated successfully" };
  } catch (error) {
    console.error("Failed to update acquisition status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}
