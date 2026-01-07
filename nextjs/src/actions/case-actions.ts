"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

interface ActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function createCaseAction(
  formData: FormData
): Promise<ActionResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  const rawData = {
    title: formData.get("title"),
    caseNumber: formData.get("caseNumber"),
    description: formData.get("description"),
    // ... extract other fields
  };

  // 1. Validate (Simplistic example, use Zod in production)
  if (!rawData.title || !rawData.caseNumber) {
    return {
      success: false,
      message: "Validation failed: Title and Case Number are required.",
    };
  }

  // 2. Mutate Backend
  try {
    const res = await fetch(`${BACKEND_URL}/api/cases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(rawData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || "Failed to create case",
      };
    }

    // 3. Revalidate & Redirect
    revalidatePath("/cases");
  } catch (err) {
    console.error("Create Case Error:", err);
    return {
      success: false,
      message: "Network error occurred.",
    };
  }

  // Redirect must happen outside try/catch if it uses "next/navigation" which throws
  redirect("/cases");
}
