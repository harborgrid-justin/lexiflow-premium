import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/legal-entities/stats
 * Get entity statistics
 * Migrated from: backend/src/legal-entities/legal-entities.controller.ts
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/legal-entities/stats`);
}
