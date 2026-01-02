import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * API Keys Management Routes
 * Migrated from: backend/src/api-keys/api-keys.controller.ts
 * Note: Admin-only endpoints
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/api-keys`);
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, `/api/api-keys`);
}
