// DAL: Data Access Layer for Docket

import "server-only";
import { cookies } from "next/headers";

export interface DocketEntry {
  id: string;
  caseId: string;
  entryDate: string;
  description: string;
  filedBy: string;
  documentUrl?: string;
  sequenceNumber?: number;
}

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export const getDocketEntries = async (
  caseId?: string
): Promise<DocketEntry[]> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  // Mock
  if (!token) {
    return [
      {
        id: "101",
        caseId: "1",
        entryDate: new Date().toISOString(),
        description: "Complaint Filed",
        filedBy: "Plaintiff",
        sequenceNumber: 1,
      },
      {
        id: "102",
        caseId: "1",
        entryDate: new Date().toISOString(),
        description: "Summons Issued",
        filedBy: "Clerk",
        sequenceNumber: 2,
      },
      {
        id: "201",
        caseId: "2",
        entryDate: new Date().toISOString(),
        description: "Indictment",
        filedBy: "State",
        sequenceNumber: 1,
      },
    ];
  }

  const queryParams = caseId ? `?caseId=${caseId}` : "";

  try {
    const res = await fetch(`${BACKEND_URL}/api/docket${queryParams}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { tags: ["docket"] },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
};
