"use server";

/**
 * Solicitations Server Actions
 *
 * @module app/(main)/real-estate/solicitations/actions
 */

import { revalidateTag } from "next/cache";
import {
  createSolicitation,
  REAL_ESTATE_TAGS,
  type SolicitationType,
} from "@/lib/dal/real-estate";

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function createSolicitationAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const title = formData.get("title") as string;
    const solicitationType = formData.get("solicitationType") as SolicitationType;
    const description = formData.get("description") as string;
    const dueDate = formData.get("dueDate") as string;
    const estimatedValue = formData.get("estimatedValue") as string;

    if (!title || !description) {
      return { success: false, error: "Title and description are required" };
    }

    await createSolicitation({
      title,
      solicitationType: solicitationType || "RFP",
      status: "Draft",
      description,
      dueDate: dueDate || undefined,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
    });

    revalidateTag(REAL_ESTATE_TAGS.SOLICITATIONS);

    return { success: true, message: "Solicitation created successfully" };
  } catch (error) {
    console.error("Failed to create solicitation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create solicitation",
    };
  }
}
