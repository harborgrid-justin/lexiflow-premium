import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Jurisdictions API Routes
 * Migrated from: backend/src/jurisdictions/jurisdictions.controller.ts
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/jurisdictions`);
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, `/api/jurisdictions`);
}
