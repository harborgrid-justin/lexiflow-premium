"use server";

/**
 * Audit Readiness Server Actions
 *
 * @module app/(main)/real-estate/audit-readiness/actions
 */

import { revalidateTag } from "next/cache";
import {
  createAuditItem,
  updateAuditItem,
  REAL_ESTATE_TAGS,
  type AuditType,
  type AuditStatus,
} from "@/lib/dal/real-estate";

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function createAuditItemAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const propertyId = formData.get("propertyId") as string;
    const propertyName = formData.get("propertyName") as string;
    const auditType = formData.get("auditType") as AuditType;
    const nextAuditDate = formData.get("nextAuditDate") as string;

    if (!propertyId || !propertyName) {
      return { success: false, error: "Property ID and name are required" };
    }

    await createAuditItem({
      propertyId,
      propertyName,
      auditType: auditType || "Financial",
      status: "Not Started",
      nextAuditDate: nextAuditDate || undefined,
    });

    revalidateTag(REAL_ESTATE_TAGS.AUDIT_ITEMS);

    return { success: true, message: "Audit item created successfully" };
  } catch (error) {
    console.error("Failed to create audit item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create audit item",
    };
  }
}

export async function updateAuditItemAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const id = formData.get("id") as string;
    const status = formData.get("status") as AuditStatus;
    const findings = formData.get("findings") as string;

    if (!id) {
      return { success: false, error: "ID is required" };
    }

    await updateAuditItem(id, {
      status,
      findings: findings || undefined,
    });

    revalidateTag(REAL_ESTATE_TAGS.AUDIT_ITEMS);

    return { success: true, message: "Audit item updated successfully" };
  } catch (error) {
    console.error("Failed to update audit item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update audit item",
    };
  }
}
