// DAL: Data Access Layer for Documents

import "server-only";
import { cookies } from "next/headers";

export interface Document {
  id: string;
  title: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  caseId?: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: string;
  ocrStatus?: "pending" | "completed" | "failed" | "processing";
}

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export const getDocuments = async (): Promise<Document[]> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  //   if (!token) throw new Error("Unauthorized");
  // For demo, if no token, mock it
  if (!token) {
    console.warn("No auth token, returning mock documents");
    return [
      {
        id: "1",
        title: "Smith v. Jones - Complaint",
        filename: "complaint.pdf",
        url: "#",
        mimeType: "application/pdf",
        size: 102400,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ocrStatus: "completed",
      },
      {
        id: "2",
        title: "Exhibit A",
        filename: "exhibit_a.png",
        url: "#",
        mimeType: "image/png",
        size: 52400,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ocrStatus: "pending",
      },
    ];
  }

  const res = await fetch(`${BACKEND_URL}/api/documents`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { tags: ["documents"] }, // for re-validation
  });

  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error("Failed to fetch documents");
  }

  return res.json();
};

export const getDocumentContent = async (id: string): Promise<string> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return "Mock content for document " + id; // Mock for demo

  const res = await fetch(`${BACKEND_URL}/api/documents/${id}/content`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch content");
  const data = await res.json();
  return data.content || "";
};
