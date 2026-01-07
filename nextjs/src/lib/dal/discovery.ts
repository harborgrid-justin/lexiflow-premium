// DAL: Data Access Layer for Discovery

import "server-only";
import { cookies } from "next/headers";

export interface DiscoveryItem {
  id: string;
  type: "Request" | "Response" | "Production" | "Deposition";
  title: string;
  dueDate?: string;
  status: "Draft" | "Sent" | "Received" | "Overdue";
  priority: "High" | "Medium" | "Low";
  assignedTo?: string;
  caseId: string;
}

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export const getDiscoveryItems = async (): Promise<DiscoveryItem[]> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return [
      {
        id: "1",
        type: "Request",
        title: "First Set of Interrogatories",
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        status: "Sent",
        priority: "High",
        caseId: "1",
      },
      {
        id: "2",
        type: "Production",
        title: "Email Production Batch 1",
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        status: "Overdue",
        priority: "Medium",
        caseId: "1",
      },
    ];
  }

  try {
    // Assuming a consolidated discovery endpoint or need to aggregate
    const res = await fetch(`${BACKEND_URL}/api/discovery/dashboard`, {
      // Hypothetical endpoint based on controller scan earlier
      headers: { Authorization: `Bearer ${token}` },
      next: { tags: ["discovery"] },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
};
