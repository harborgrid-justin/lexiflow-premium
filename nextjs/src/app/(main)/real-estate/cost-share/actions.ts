"use server";

/**
 * Cost Share Server Actions
 *
 * @module app/(main)/real-estate/cost-share/actions
 */

import { revalidateTag } from "next/cache";
import {
  createCostShare,
  REAL_ESTATE_TAGS,
  type CostShareType,
  type BillingFrequency,
} from "@/lib/dal/real-estate";

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function createCostShareAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const propertyId = formData.get("propertyId") as string;
    const propertyName = formData.get("propertyName") as string;
    const agreementType = formData.get("agreementType") as CostShareType;
    const partiesJson = formData.get("parties") as string;
    const sharePercentagesJson = formData.get("sharePercentages") as string;
    const effectiveDate = formData.get("effectiveDate") as string;
    const expirationDate = formData.get("expirationDate") as string;
    const billingFrequency = formData.get("billingFrequency") as BillingFrequency;
    const totalAmount = formData.get("totalAmount") as string;

    if (!propertyId || !effectiveDate) {
      return { success: false, error: "Property and effective date are required" };
    }

    const parties = partiesJson ? JSON.parse(partiesJson) : [];
    const sharePercentages = sharePercentagesJson ? JSON.parse(sharePercentagesJson) : {};

    await createCostShare({
      propertyId,
      propertyName: propertyName || "Unknown Property",
      agreementType: agreementType || "Utility Share",
      parties,
      sharePercentages,
      effectiveDate,
      expirationDate: expirationDate || undefined,
      billingFrequency: billingFrequency || "Monthly",
      status: "Active",
      totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
    });

    revalidateTag(REAL_ESTATE_TAGS.COST_SHARES);

    return { success: true, message: "Cost share agreement created successfully" };
  } catch (error) {
    console.error("Failed to create cost share:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create cost share",
    };
  }
}
