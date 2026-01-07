// DAL for Research

import "server-only";
import { cookies } from "next/headers";

export interface ResearchSession {
  id: string;
  query: string;
  timestamp: string;
  resultsCount: number;
  sources: string[];
}

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export const getResearchHistory = async (): Promise<ResearchSession[]> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    console.warn("No auth token, returning mock research history");
    return [
      {
        id: "1",
        query: "Statute of limitations for fraud in NY",
        timestamp: new Date().toISOString(),
        resultsCount: 15,
        sources: ["Westlaw", "Lexis"],
      },
      {
        id: "2",
        query: "Admissibility of hearsay exceptions",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        resultsCount: 42,
        sources: ["Caselaw"],
      },
    ];
  }

  const res = await fetch(`${BACKEND_URL}/api/research/history`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
};
