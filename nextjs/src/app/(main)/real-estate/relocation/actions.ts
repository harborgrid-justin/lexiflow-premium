"use server";

/**
 * Relocation Server Actions
 *
 * @module app/(main)/real-estate/relocation/actions
 */

import { revalidateTag } from "next/cache";
import {
  createRelocation,
  REAL_ESTATE_TAGS,
  type RelocationType,
} from "@/lib/dal/real-estate";

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function createRelocationAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const fromPropertyId = formData.get("fromPropertyId") as string;
    const fromPropertyName = formData.get("fromPropertyName") as string;
    const toPropertyId = formData.get("toPropertyId") as string;
    const toPropertyName = formData.get("toPropertyName") as string;
    const relocationType = formData.get("relocationType") as RelocationType;
    const scheduledDate = formData.get("scheduledDate") as string;
    const estimatedCost = formData.get("estimatedCost") as string;
    const coordinator = formData.get("coordinator") as string;

    if (!fromPropertyId) {
      return { success: false, error: "Source property is required" };
    }

    await createRelocation({
      fromPropertyId,
      fromPropertyName: fromPropertyName || "Unknown Property",
      toPropertyId: toPropertyId || undefined,
      toPropertyName: toPropertyName || undefined,
      relocationType: relocationType || "Department",
      status: "Planning",
      scheduledDate: scheduledDate || undefined,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      coordinator: coordinator || undefined,
    });

    revalidateTag(REAL_ESTATE_TAGS.RELOCATIONS);

    return { success: true, message: "Relocation created successfully" };
  } catch (error) {
    console.error("Failed to create relocation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create relocation",
    };
  }
}
