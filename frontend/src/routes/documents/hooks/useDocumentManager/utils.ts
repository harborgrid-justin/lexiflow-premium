/**
 * Utility functions for useDocumentManager hook
 * @module hooks/useDocumentManager/utils
 */

import { FILE_UPLOAD_CONFIG, TAG_VALIDATION } from "./constants";

import type { DocumentStats } from "./types";
import type { LegalDocument } from "@/types";

/**
 * Validate document ID parameter
 */
export function validateDocId(docId: string, methodName: string): boolean {
  if (!docId || docId.trim() === "") {
    console.error(
      `[useDocumentManager.${methodName}] Invalid docId parameter:`,
      docId
    );
    return false;
  }
  return true;
}

/**
 * Validate and sanitize tag
 */
export function validateTag(tag: string): string {
  if (!tag) return "";

  return tag
    .replace(TAG_VALIDATION.SANITIZE_REGEX, "")
    .trim()
    .slice(0, TAG_VALIDATION.MAX_LENGTH);
}

/**
 * Validate file for upload
 */
export function validateFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!file || !file.name) {
    return { valid: false, error: "Invalid file" };
  }

  if (file.size > FILE_UPLOAD_CONFIG.MAX_SIZE) {
    return {
      valid: false,
      error: `File ${file.name} exceeds ${FILE_UPLOAD_CONFIG.MAX_SIZE_LABEL} limit`,
    };
  }

  return { valid: true };
}

/**
 * Compute document statistics
 */
export function computeDocumentStats(
  documents: LegalDocument[]
): DocumentStats {
  try {
    return {
      total: documents.length,
      evidence: documents.filter((d) => d.sourceModule === "Evidence").length,
      discovery: documents.filter((d) => d.sourceModule === "Discovery").length,
      signed: documents.filter((d) => d.status === "Signed").length,
    };
  } catch (error) {
    console.error("[useDocumentManager] Error computing stats:", error);
    return { total: 0, evidence: 0, discovery: 0, signed: 0 };
  }
}

/**
 * Extract all unique tags from documents
 */
export function extractAllTags(documents: LegalDocument[]): string[] {
  try {
    return Array.from(new Set(documents.flatMap((d) => d.tags || [])));
  } catch (error) {
    console.error("[useDocumentManager] Error extracting tags:", error);
    return [];
  }
}

/**
 * Apply context filters (folder, module) to documents
 */
export function applyContextFilters(
  documents: LegalDocument[],
  currentFolder: string,
  activeModuleFilter: string,
  searchTerm: string
): LegalDocument[] {
  try {
    return documents.filter((d) => {
      const inFolder =
        currentFolder === "root" ? true : d.folderId === currentFolder;

      const matchesModule =
        activeModuleFilter === "All" || d.sourceModule === activeModuleFilter;

      return matchesModule && (searchTerm ? true : inFolder);
    });
  } catch (error) {
    console.error("[useDocumentManager] Context filtering error:", error);
    return documents;
  }
}
