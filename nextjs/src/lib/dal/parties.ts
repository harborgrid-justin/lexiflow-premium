// DAL: Data Access Layer for Parties

import "server-only";
import { cookies } from "next/headers";

export enum PartyType {
  PLAINTIFF = "Plaintiff",
  DEFENDANT = "Defendant",
  WITNESS = "Witness",
  INDIVIDUAL = "individual",
  CORPORATION = "corporation",
  OTHER = "Other",
}

export enum PartyRole {
  PRIMARY = "Primary",
  CO_PARTY = "Co-Party",
  OTHER = "Other",
}

export interface Party {
  id: string;
  name: string;
  type: PartyType;
  role: PartyRole;
  email?: string;
  phone?: string;
  caseId?: string; // If tied to single case, though relation might be many-to-many
  createdAt: string;
  updatedAt: string;
}

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export const getParties = async (): Promise<Party[]> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  // Mock if unauthorized or dev
  if (!token) {
    console.warn("No auth token, returning mock parties");
    return [
      {
        id: "1",
        name: "John Smith",
        type: PartyType.PLAINTIFF,
        role: PartyRole.PRIMARY,
        email: "john@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Acme Corp",
        type: PartyType.DEFENDANT,
        role: PartyRole.PRIMARY,
        email: "legal@acme.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/parties`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { tags: ["parties"] },
    });

    if (!res.ok) {
      if (res.status === 401) return [];
      throw new Error("Failed to fetch parties");
    }

    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};
