import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/jurisdictions/federal
 * Get federal court jurisdictions
 * Migrated from: backend/src/jurisdictions/jurisdictions.controller.ts
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/jurisdictions/federal`);
}
