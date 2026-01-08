"use server";

/**
 * Disposal Server Actions
 *
 * @module app/(main)/real-estate/disposal/actions
 */

import { revalidateTag } from "next/cache";
import {
  createDisposal,
  updateDisposal,
  REAL_ESTATE_TAGS,
  type DisposalStatus,
  type DisposalType,
} from "@/lib/dal/real-estate";

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function createDisposalAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const propertyId = formData.get("propertyId") as string;
    const propertyName = formData.get("propertyName") as string;
    const disposalType = formData.get("disposalType") as DisposalType;
    const reason = formData.get("reason") as string;
    const estimatedValue = formData.get("estimatedValue") as string;

    if (!propertyId || !reason) {
      return { success: false, error: "Property ID and reason are required" };
    }

    await createDisposal({
      propertyId,
      propertyName: propertyName || "Unknown Property",
      disposalType: disposalType || "Sale",
      status: "Pending",
      reason,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
    });

    revalidateTag(REAL_ESTATE_TAGS.DISPOSALS);
    revalidateTag(REAL_ESTATE_TAGS.STATS);

    return { success: true, message: "Disposal created successfully" };
  } catch (error) {
    console.error("Failed to create disposal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create disposal",
    };
  }
}

export async function updateDisposalAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const id = formData.get("id") as string;
    const status = formData.get("status") as DisposalStatus;
    const actualValue = formData.get("actualValue") as string;

    if (!id) {
      return { success: false, error: "ID is required" };
    }

    const updates: Partial<{
      status: DisposalStatus;
      actualValue: number;
      completionDate: string;
    }> = {};

    if (status) {
      updates.status = status;
      if (status === "Completed") {
        updates.completionDate = new Date().toISOString();
      }
    }

    if (actualValue) {
      updates.actualValue = parseFloat(actualValue);
    }

    await updateDisposal(id, updates);

    revalidateTag(REAL_ESTATE_TAGS.DISPOSALS);
    revalidateTag(REAL_ESTATE_TAGS.STATS);

    return { success: true, message: "Disposal updated successfully" };
  } catch (error) {
    console.error("Failed to update disposal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update disposal",
    };
  }
}
