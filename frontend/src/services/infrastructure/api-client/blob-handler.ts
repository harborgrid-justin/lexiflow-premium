/**
 * Blob Handler
 * Handles binary data requests (files, PDFs, images)
 */

import { AuthenticationError } from "@/services/core/errors";

import { buildBaseURL, DEFAULT_TIMEOUT, getOrigin } from "./config";
import { buildHeaders, buildURL, validateEndpoint } from "./request-builder";
import { handleResponse } from "./response-handler";

/**
 * GET request for Blob (binary data)
 */
export async function getBlob(
  endpoint: string,
  params?: Record<string, unknown>
): Promise<Blob> {
  validateEndpoint(endpoint, "getBlob");
  try {
    const baseURL = buildBaseURL();
    const url = buildURL(baseURL, endpoint, getOrigin(), params);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: await buildHeaders(),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    });

    if (!response.ok) {
      // Reuse handleResponse logic for errors
      await handleResponse(response);
    }

    return await response.blob();
  } catch (error) {
    if (
      error instanceof AuthenticationError &&
      error.message === "TOKEN_REFRESHED"
    ) {
      return getBlob(endpoint, params);
    }
    console.error("[BlobHandler.getBlob] Error:", error);
    throw error;
  }
}
