"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export async function uploadDocument(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return { success: false, message: "Unauthorized: Please log in." };
  }

  // Prepare FormData for backend
  const file = formData.get("file");
  if (!file) {
    return { success: false, message: "No file provided" };
  }

  try {
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const caseId = formData.get("caseId");
    if (caseId) backendFormData.append("caseId", caseId);

    const res = await fetch(`${BACKEND_URL}/api/documents/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
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

    revalidatePath("/documents");
    return { success: true, message: "Document uploaded successfully" };
  } catch (error) {
    console.error("Upload Action Error:", error);
    return { success: false, message: "Internal server error during upload" };
  }
}
