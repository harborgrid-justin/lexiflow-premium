"use server";

/**
 * Encroachment Server Actions
 *
 * @module app/(main)/real-estate/encroachment/actions
 */

import { revalidateTag } from "next/cache";
import {
  createEncroachment,
  updateEncroachment,
  REAL_ESTATE_TAGS,
  type EncroachmentType,
  type EncroachmentStatus,
} from "@/lib/dal/real-estate";

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function createEncroachmentAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const propertyId = formData.get("propertyId") as string;
    const propertyName = formData.get("propertyName") as string;
    const encroachmentType = formData.get("encroachmentType") as EncroachmentType;
    const description = formData.get("description") as string;

    if (!propertyId || !description) {
      return { success: false, error: "Property and description are required" };
    }

    await createEncroachment({
      propertyId,
      propertyName: propertyName || "Unknown Property",
      encroachmentType: encroachmentType || "Other",
      status: "Active",
      description,
      discoveredDate: new Date().toISOString(),
    });

    revalidateTag(REAL_ESTATE_TAGS.ENCROACHMENTS);
    revalidateTag(REAL_ESTATE_TAGS.STATS);

    return { success: true, message: "Encroachment reported successfully" };
  } catch (error) {
    console.error("Failed to create encroachment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to report encroachment",
    };
  }
}

export async function updateEncroachmentAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const id = formData.get("id") as string;
    const status = formData.get("status") as EncroachmentStatus;
    const resolutionMethod = formData.get("resolutionMethod") as string;

    if (!id) {
      return { success: false, error: "ID is required" };
    }

    const updates: Partial<{
      status: EncroachmentStatus;
      resolutionMethod: string;
      resolvedDate: string;
    }> = {};

    if (status) {
      updates.status = status;
      if (status === "Resolved") {
        updates.resolvedDate = new Date().toISOString();
      }
    }

    if (resolutionMethod) {
      updates.resolutionMethod = resolutionMethod;
    }

    await updateEncroachment(id, updates);

    revalidateTag(REAL_ESTATE_TAGS.ENCROACHMENTS);
    revalidateTag(REAL_ESTATE_TAGS.STATS);

    return { success: true, message: "Encroachment updated successfully" };
  } catch (error) {
    console.error("Failed to update encroachment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update encroachment",
    };
  }
}

export async function resolveEncroachmentAction(
  id: string,
  method: string,
  notes?: string
): Promise<ActionResult> {
  try {
    await updateEncroachment(id, {
      status: "Resolved",
      resolutionMethod: method,
      resolvedDate: new Date().toISOString(),
    });

    revalidateTag(REAL_ESTATE_TAGS.ENCROACHMENTS);
    revalidateTag(REAL_ESTATE_TAGS.STATS);

    return { success: true, message: "Encroachment resolved successfully" };
  } catch (error) {
    console.error("Failed to resolve encroachment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to resolve encroachment",
    };
  }
}
