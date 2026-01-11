/**
 * Document Workflow API
 * Workflow operations for document review and approval
 */

import { ApiClient } from "@/services/infrastructure/apiClient";
import type { GeneratedDocument } from "./types";

/**
 * Submit document for review
 */
export async function submitForReview(
  client: ApiClient,
  id: string
): Promise<GeneratedDocument> {
  return client.post<GeneratedDocument>(
    `/drafting/documents/${id}/submit`,
    {}
  );
}

/**
 * Approve document
 */
export async function approveDocument(
  client: ApiClient,
  id: string,
  notes?: string
): Promise<GeneratedDocument> {
  return client.post<GeneratedDocument>(
    `/drafting/documents/${id}/approve`,
    { notes }
  );
}

/**
 * Reject document
 */
export async function rejectDocument(
  client: ApiClient,
  id: string,
  notes: string
): Promise<GeneratedDocument> {
  return client.post<GeneratedDocument>(
    `/drafting/documents/${id}/reject`,
    { notes }
  );
}

/**
 * Finalize document
 */
export async function finalizeDocument(
  client: ApiClient,
  id: string
): Promise<GeneratedDocument> {
  return client.post<GeneratedDocument>(
    `/drafting/documents/${id}/finalize`,
    {}
  );
}
