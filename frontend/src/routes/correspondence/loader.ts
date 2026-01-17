/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { communicationsApi } from "@/lib/frontend-api";

import type { LoaderFunctionArgs } from "react-router";
// LoaderFunctionArgs provides type safety even if we don't use all properties
export async function clientLoader(_args: LoaderFunctionArgs) {
  const result = await communicationsApi.getAllCorrespondence({
    page: 1,
    limit: 200,
  });

  const items = result.ok ? result.data.data : [];

  const emails = items
    .filter((item) => item.correspondenceType === "email")
    .map((item) => ({
      id: item.id,
      read: item.status === "received",
      from: item.sender || "Unknown",
      date: item.date,
      subject: item.subject,
      preview: item.notes || "",
    }));

  const letters = items
    .filter((item) => item.correspondenceType === "letter")
    .map((item) => ({
      id: item.id,
      title: item.subject,
      recipient: item.recipients?.join(", ") || "Unknown",
      date: item.date,
    }));

  const templates = items
    .filter((item) => item.status === "draft")
    .map((item) => ({
      id: item.id,
      name: item.subject,
      category: item.correspondenceType,
    }));

  return { emails, letters, templates };
}
