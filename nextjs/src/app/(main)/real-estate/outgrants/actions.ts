"use server";

/**
 * Outgrants Server Actions
 *
 * @module app/(main)/real-estate/outgrants/actions
 */

import { revalidateTag } from "next/cache";
import {
  createOutgrant,
  REAL_ESTATE_TAGS,
  type OutgrantType,
} from "@/lib/dal/real-estate";

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function createOutgrantAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const propertyId = formData.get("propertyId") as string;
    const propertyName = formData.get("propertyName") as string;
    const grantType = formData.get("grantType") as OutgrantType;
    const grantee = formData.get("grantee") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const monthlyRent = formData.get("monthlyRent") as string;

    if (!propertyId || !grantee || !startDate) {
      return { success: false, error: "Property, grantee, and start date are required" };
    }

    await createOutgrant({
      propertyId,
      propertyName: propertyName || "Unknown Property",
      grantType: grantType || "Lease",
      grantee,
      status: "Active",
      startDate,
      endDate: endDate || undefined,
      monthlyRent: monthlyRent ? parseFloat(monthlyRent) : undefined,
    });

    revalidateTag(REAL_ESTATE_TAGS.OUTGRANTS);

    return { success: true, message: "Outgrant created successfully" };
  } catch (error) {
    console.error("Failed to create outgrant:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create outgrant",
    };
  }
}
