/**
 * File Upload Handler
 * Handles multipart/form-data file uploads
 */

import { AuthenticationError, ValidationError } from "@/services/core/errors";
import { buildBaseURL, getOrigin } from "./config";
import { validateEndpoint, buildURL } from "./request-builder";
import { getAuthToken } from "./auth-manager";
import { handleResponse } from "./response-handler";

/**
 * Upload file with multipart/form-data
 */
export async function upload<T>(
  endpoint: string,
  file: File,
  additionalData?: Record<string, unknown>
): Promise<T> {
  validateEndpoint(endpoint, "upload");
  if (!file || !(file instanceof File)) {
    throw new ValidationError("[FileUpload.upload] Invalid file parameter");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, String(additionalData[key]));
      });
    }

    const token = getAuthToken();
    const headers: HeadersInit = {
      "X-Requested-With": "XMLHttpRequest",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    // Do NOT set Content-Type for multipart/form-data (browser sets it with boundary)

    const baseURL = buildBaseURL();
    const url = buildURL(baseURL, endpoint, getOrigin());

    const response = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: formData,
      signal: AbortSignal.timeout(60000), // 60s timeout for file uploads
    });

    return await handleResponse<T>(response);
  } catch (error) {
    if (
      error instanceof AuthenticationError &&
      error.message === "TOKEN_REFRESHED"
    ) {
      return upload<T>(endpoint, file, additionalData);
    }
    console.error("[FileUpload.upload] Error:", error);
    throw error;
  }
}
