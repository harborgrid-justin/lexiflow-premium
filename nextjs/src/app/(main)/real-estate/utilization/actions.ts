"use server";

/**
 * Utilization Server Actions
 *
 * @module app/(main)/real-estate/utilization/actions
 */

import { revalidateTag } from "next/cache";
import {
  createUtilization,
  updateUtilization,
  REAL_ESTATE_TAGS,
} from "@/lib/dal/real-estate";

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function createUtilizationAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const propertyId = formData.get("propertyId") as string;
    const propertyName = formData.get("propertyName") as string;
    const primaryUse = formData.get("primaryUse") as string;
    const totalCapacity = formData.get("totalCapacity") as string;
    const currentOccupancy = formData.get("currentOccupancy") as string;
    const departments = formData.get("departments") as string;
    const recommendations = formData.get("recommendations") as string;

    if (!propertyId || !propertyName || !primaryUse || !totalCapacity || !currentOccupancy) {
      return { success: false, error: "Property ID, name, primary use, capacity, and occupancy are required" };
    }

    const capacity = parseInt(totalCapacity, 10);
    const occupancy = parseInt(currentOccupancy, 10);
    const utilizationRate = capacity > 0 ? (occupancy / capacity) * 100 : 0;

    await createUtilization({
      propertyId,
      propertyName,
      primaryUse,
      totalCapacity: capacity,
      currentOccupancy: occupancy,
      utilizationRate,
      departments: departments ? departments.split(",").map((d) => d.trim()).filter(Boolean) : undefined,
      recommendations: recommendations || undefined,
      lastAssessmentDate: new Date().toISOString().split("T")[0],
    });

    revalidateTag(REAL_ESTATE_TAGS.UTILIZATION);
    revalidateTag(REAL_ESTATE_TAGS.STATS);

    return { success: true, message: "Utilization record created successfully" };
  } catch (error) {
    console.error("Failed to create utilization record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create utilization record",
    };
  }
}

export async function updateUtilizationAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const id = formData.get("id") as string;
    const currentOccupancy = formData.get("currentOccupancy") as string;
    const recommendations = formData.get("recommendations") as string;

    if (!id) {
      return { success: false, error: "ID is required" };
    }

    await updateUtilization(id, {
      currentOccupancy: currentOccupancy ? parseInt(currentOccupancy, 10) : undefined,
      recommendations: recommendations || undefined,
    });

    revalidateTag(REAL_ESTATE_TAGS.UTILIZATION);
    revalidateTag(REAL_ESTATE_TAGS.STATS);

    return { success: true, message: "Utilization updated successfully" };
  } catch (error) {
    console.error("Failed to update utilization:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update utilization",
    };
  }
}
