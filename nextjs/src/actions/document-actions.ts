"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export async function uploadDocument(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  // In a real app we would check token here
  // if (!token) throw new Error('Unauthorized');

  // Prepare FormData for backend
  // The backend likely expects 'file' field
  const file = formData.get("file");
  if (!file) {
    return { success: false, message: "No file provided" };
  }

  try {
    if (!token) {
      // Mock success for demo
      console.log("Mock upload successful");
      revalidateTag("documents");
      return { success: true, message: "File uploaded (simulated)" };
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);
    // Add other fields if needed, e.g. caseId
    const caseId = formData.get("caseId");
    if (caseId) backendFormData.append("caseId", caseId);

    const res = await fetch(`${BACKEND_URL}/api/documents/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Note: Content-Type header is not set manually for FormData,
        // fetch handles multipart boundary automatically
      },
      body: backendFormData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        message: `Upload failed: ${res.statusText} - ${errorText}`,
      };
    }

    revalidateTag("documents");
    return { success: true, message: "Document uploaded successfully" };
  } catch (error) {
    console.error("Upload Action Error:", error);
    return { success: false, message: "Internal server error during upload" };
  }
}
